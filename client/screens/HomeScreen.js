import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import jwt_decode from "jwt-decode";
import axios from "axios";
import User from "../components/User";
import { decode as atob } from "base-64";
import { BASEURL } from "../constants";
import { UserType } from "./UserContext";

if (typeof global.atob === "undefined") {
  global.atob = atob;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const {userId,token}=useContext(UserType)

  // Fetch users when the component mounts
  useEffect(() => {
      const fetchUsers = async () => {
        try {
        
        
          const response = await axios.get(
            `${BASEURL}/users/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setUsers(response.data);
        } catch (error) {
          console.log("Error retrieving users here:", error);
        }
      };

      fetchUsers();
    }
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chats</Text>
        <View style={styles.icons}>
          <Ionicons
            onPress={() => {
              console.log("Navigating to Chats");
              navigation.navigate("Chats");
            }}
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
          />

          <MaterialIcons
            onPress={() => navigation.navigate("Friends")}
            name="people-outline"
            size={24}
            color="black"
          />
        </View>
      </View>
      <View style={styles.userList}>
        {users.map((item, index) => (
          <User key={index} item={item} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userList: {
    padding: 10,
  },
});

export default HomeScreen;
