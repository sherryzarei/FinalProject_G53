import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import UserChat from "../components/UserChat";
import { UserType } from "./UserContext";
import { BASEURL } from "../constants";

const ChatsScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId, token } = useContext(UserType);

  console.log("Accepted Friends:", acceptedFriends);
  useEffect(() => {
    const fetchAcceptedFriends = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(`${BASEURL}/accepted-friends/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const processedFriends = response.data.map((friend) => ({
          _id: friend._id,
          name: friend.name,
          email: friend.email,
          image: friend.image ? `${BASEURL}/user/${friend._id}/image` : null,
        }));

        setAcceptedFriends(processedFriends);
      } catch (err) {
        console.error("Error fetching accepted friends:", err);
        setError("Failed to fetch friends. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcceptedFriends();
  }, [userId, token]);

  const renderFriendItem = ({ item }) => <UserChat item={item} />;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : acceptedFriends.length > 0 ? (
        <FlatList
          data={acceptedFriends}
          keyExtractor={(item) => item._id}
          renderItem={renderFriendItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noFriendsContainer}>
          <Text style={styles.noFriendsText}>No friends available</Text>
        </View>
      )}
    </View>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  noFriendsContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  noFriendsText: { fontSize: 16, color: "#555", textAlign: "center" },
});
