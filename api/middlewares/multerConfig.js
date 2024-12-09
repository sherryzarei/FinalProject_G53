const multer = require("multer");

// Configure Multer Storage
const storage = multer.memoryStorage();

// Create Multer Instance
const upload = multer({ storage });

module.exports = upload;
