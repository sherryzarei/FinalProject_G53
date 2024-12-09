import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { BASEURL } from "../constants";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");

  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera access is required to take a photo."
        );
      }
    })();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    if (image) {
      const localUri = image;
      const filename = localUri.split("/").pop();
      const fileType = filename.split(".").pop();
      formData.append("image", {
        uri: localUri,
        name: filename,
        type: `image/${fileType}`,
      });
    }

    try {
      console.log("Sending data:", formData);
      const response = await axios.post(`${BASEURL}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Registration response:", response.data);
      Alert.alert("Success", "User registered successfully");
      setName("");
      setEmail("");
      setPassword("");
      setImage("");
      navigation.navigate("Login");
    } catch (err) {
      console.error(
        "Error registering user:",
        err.response ? err.response.data : err
      );
      Alert.alert("Error", "Could not register user.");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to take a photo."
      );
      return;
    }

    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Photo result:", result);

      if (!result.canceled) {
        setImage(result.assets[0].uri); // Correctly store the photo URI
      } else {
        console.log("Camera canceled or no photo captured.");
      }
    } catch (error) {
      console.error("Error launching camera:", error);
    }
  };

  // New function to select an image from the gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Gallery access is required to choose a photo."
      );
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Gallery result:", result);

      if (!result.canceled) {
        setImage(result.assets[0].uri); // Correctly store the selected image URI
      } else {
        console.log("Gallery selection canceled or no photo chosen.");
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <ScrollView>
          <View>
            <Image
              source={require("../assets/chefster_logo_white_caption.png")}
              style={{ width: 300, height: 300, marginTop: 70 }}
              resizeMode="contain"
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
              Email
            </Text>
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
          </View>
          <View style={{ marginTop: 30 }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
              Full Name
            </Text>
            <TextInput
              placeholder="Enter your Full Name"
              style={styles.input}
              value={name}
              onChangeText={(text) => setName(text)}
            />
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
              Password
            </Text>
            <TextInput
              placeholder="Enter your password"
              style={styles.input}
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
              Photo
            </Text>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={{ color: "gray", fontWeight: "bold" }}>
                Take a photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={pickImage} // Button for selecting image from gallery
            >
              <Text style={{ color: "gray", fontWeight: "bold" }}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{
                  width: 100,
                  height: 100,
                  marginTop: 20,
                  borderRadius: 10,
                }}
              />
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Sign Up</Text>
          </TouchableOpacity>

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={{ color: "red", fontWeight: "bold" }}>Sign In</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "black",
    alignItems: "center",
  },
  input: {
    color: "black",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    width: 300,
    height: 50,
  },
  button: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    width: 300,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButton: {
    backgroundColor: "red",
    marginTop: 40,
    padding: 10,
    borderRadius: 20,
    width: 125,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 80,
  },
  loginText: {
    color: "white",
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 40,
    fontWeight: "500",
    marginBottom: 60,
    fontSize: 15,
  },
});
