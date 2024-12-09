const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();


const app = express();
const port = process.env.PORT || 8100;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());

// MongoDB connection
mongoose
    .connect(
        "mongodb+srv://salazar-davinci:excalibur2018@cluster0.kdxgw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Models
const User = require("./models/user");
const Message = require("./models/message");

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper functions
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Endpoints

// User Registration
app.post("/register", upload.single("image"), async (req, res) => {
    const { name, email, password } = req.body;
    const image = req.file;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        const normalizedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            image: image
                ? {
                    data: image.buffer,
                    contentType: image.mimetype,
                }
                : undefined,
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);
        res.status(200).json({ message: "Login successful", token, userID: user._id });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Retrieve User Image
// app.get("/user/:id/image", async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user || !user.image) {
//             return res.status(404).json({ message: "User or image not found" });
//         }

//         res.set("Content-Type", user.image.contentType);
//         res.send(user.image.data);
//     } catch (error) {
//         console.error("Error retrieving image:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

app.get("/friend-request/:userId", async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const user = await User.findById(userId).populate("friendRequests", "name email image").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.friendRequests);
    } catch (error) {
        console.error("Error retrieving friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Friend Requests
app.post("/friend-request", async (req, res) => {
    const { currentUserId, selectedUserId } = req.body;

    try {
        await User.findByIdAndUpdate(selectedUserId, { $push: { friendRequests: currentUserId } });
        await User.findByIdAndUpdate(currentUserId, { $push: { sentFriendRequests: selectedUserId } });
        res.status(200).json({ message: "Friend request sent successfully" });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Accept Friend Request
app.post("/friend-request/accept", async (req, res) => {
    const { senderId, recipientId } = req.body;

    try {
        const sender = await User.findById(senderId);
        const recipient = await User.findById(recipientId);

        sender.friends.push(recipientId);
        recipient.friends.push(senderId);

        recipient.friendRequests = recipient.friendRequests.filter(
            (id) => id.toString() !== senderId.toString()
        );

        sender.sentFriendRequests = sender.sentFriendRequests.filter(
            (id) => id.toString() !== recipientId.toString()
        );

        await sender.save();
        await recipient.save();

        res.status(200).json({ message: "Friend request accepted successfully" });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

  const router = express.Router();

// Get Friend Requests
app.get("/friend-request/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate("friendRequests", "name email image").lean();
        res.json(user.friendRequests);
    } catch (error) {
        console.error("Error retrieving friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.get("/accepted-friends/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user and populate the friends field
        const user = await User.findById(userId).populate("friends", "name email image");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Transform the friends' data for the response
        const friends = user.friends.map(friend => ({
            id: friend._id,
            name: friend.name,
            email: friend.email,
            image: friend.image
                ? `/images/${friend._id}` // Example: Assume serving images via a route
                : null, // Return null if no image is available
        }));

        return res.status(200).json(friends);
    } catch (error) {
        console.error("Error retrieving accepted friends:", error.message);

        // Provide a user-friendly error response
        return res.status(500).json({
            message: "An error occurred while retrieving friends",
            error: error.message, // Optional: Include error message for debugging
        });
    }
});



//endpoint to post Messages and store it in the backend
app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file.path : null,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

///endpoint to get the userDetails to design the chat Room header
app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the user ID
    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to fetch the messages between two users in the chatRoom
app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to delete the messages!
app.post("/deleteMessages", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "invalid req body!" });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server" });
  }
});



// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Search for users
app.get("/search-users", async (req, res) => {
  const { query } = req.query;
  try {
      const users = await User.find({
          name: { $regex: query, $options: "i" }
      }).select("name email image");
      res.status(200).json(users);
  } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

// endpoint to access all the users except the user who's is currently logged in!
app.get("/users/:userId", (req, res) => {
    const loggedInUserId = req.params.userId; // Ensure this matches the route parameter
  
    User.find({ _id: { $ne: loggedInUserId } })
      .select("-password -image") // Exclude password and image fields
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.log("Error retrieving users in index", err);
        res.status(500).json({ message: "Error retrieving users in here" });
      });
  });
  
  // Middleware for consistent error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error", error: err.message });
});

// Send a message
// app.post("/messages", async (req, res) => {
//     try {
//         const { senderId, recipientId, messageType, messageText } = req.body;

//         console.log("Incoming Request Body:", req.body);

//         if (!senderId || !mongoose.Types.ObjectId.isValid(senderId)) {
//             return res.status(400).json({ message: "Invalid or missing senderId" });
//         }

//         if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
//             return res.status(400).json({ message: "Invalid or missing recipientId" });
//         }

//         const newMessage = new Message({
//             senderId,
//             recipientId,
//             messageType,
//             message: messageText || "",
//             timeStamp: new Date(),
//         });

//         await newMessage.save();
//         res.status(201).json({ message: "Message sent successfully", data: newMessage });
//     } catch (error) {
//         console.error("Error in /messages endpoint:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });



// // Fetch messages
// app.get("/messages/:senderId/:recipientId", async (req, res, next) => {
//     const { senderId, recipientId } = req.params;
  
//     // Validate presence of IDs
//     if (!senderId || !recipientId) {
//       return res.status(400).json({ message: "senderId and recipientId are required" });
//     }
  
//     // Validate ObjectId format
//     if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
//       return res.status(400).json({ message: "Invalid senderId or recipientId" });
//     }
  
//     try {
//       const messages = await Message.find({
//         $or: [
//           { senderId: new mongoose.Types.ObjectId(senderId), recipientId: new mongoose.Types.ObjectId(recipientId) },
//           { senderId: new mongoose.Types.ObjectId(recipientId), recipientId: new mongoose.Types.ObjectId(senderId) },
//         ],
//       }).sort({ timestamp: 1 });
  
//       res.status(200).json({ data: messages });
//     } catch (error) {
//       next(error);
//     }
//   });
  

// // Delete messages
// app.post("/deleteMessages", async (req, res, next) => {
//     try {
//         const { messages } = req.body;
//         if (!Array.isArray(messages) || messages.length === 0) {
//             return res.status(400).json({ message: "Invalid request body" });
//         }
//         await Message.deleteMany({ _id: { $in: messages } });
//         res.status(200).json({ message: "Messages deleted successfully" });
//     } catch (error) {
//         next(error);
//     }
// });

// Fetch recipient details
app.get("/user/:id/image", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.image) {
            return res.status(404).json({ message: "User or image not found" });
        }
        res.set("Content-Type", user.image.contentType);
        res.send(user.image.data);
    } catch (error) {
        next(error);
    }
});
