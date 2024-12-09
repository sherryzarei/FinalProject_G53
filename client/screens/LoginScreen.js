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
import React, { useContext, useState } from "react";
import { BASEURL } from "../constants";
import { UserType } from "./UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("Sherry@gmail.com");
  const [password, setPassword] = useState("sherry");
  const { setUserId, setToken } = useContext(UserType);

  function handleLogin() {
    // Validate the inputs
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    // Make API call to login
    fetch(`${BASEURL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data.message === "Login successful") {
          // Store the token (Optional)
          await AsyncStorage.setItem("token", data.token);
          setToken(data.token);
          // Navigate to the Home screen
          setUserId(data.userID);
          navigation.navigate("Home", { userID: data.userID });
        } else {
          Alert.alert("Login Failed", data.message);
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        Alert.alert("Error", "Something went wrong, please try again later.");
      });
  }

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
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              style={{
                color: "black",
                backgroundColor: "white",
                padding: 10,
                borderRadius: 20,
                marginTop: 10,
                width: 300,
                height: 50,
              }}
            />
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              style={{
                color: "black",
                backgroundColor: "white",
                padding: 10,
                borderRadius: 20,
                marginTop: 10,
                width: 300,
                height: 50,
              }}
            />
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "red",
              marginTop: 40,
              padding: 10,
              borderRadius: 20,
              width: 125,
              height: 50,
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 80,
              elevation: 3,
            }}
            onPress={handleLogin}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Sign In</Text>
          </TouchableOpacity>

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text
              style={{
                color: "white",
                marginTop: 25,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 40,
                fontWeight: "500",
                fontSize: 15,
              }}
            >
              Don't have an account?{" "}
              <Text style={{ color: "red", fontWeight: "bold" }}>Sign Up</Text>
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
});
