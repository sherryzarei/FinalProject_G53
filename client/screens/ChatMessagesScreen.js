import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { Entypo, Feather } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "./UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { BASEURL } from "../constants";

const ChatMessagesScreen = () => {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const { userId } = useContext(UserType);
  const route = useRoute();
  const { recipientId } = route.params;

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${BASEURL}/messages/${userId}/${recipientId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      } else {
        const errorText = await response.text();
        console.error("Error fetching messages:", errorText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [recipientId]);

  const handleSend = async (messageType, imageUri) => {
    if (!userId || !recipientId) return;

    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recipientId", recipientId);

      if (messageType === "image") {
        formData.append("messageType", "image");
        formData.append("imageFile", {
          uri: imageUri,
          name: "image.jpg",
          type: "image/jpeg",
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }

      const response = await fetch(`${BASEURL}/messages`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("");
        fetchMessages();
      } else {
        console.error("Error sending message:", await response.text());
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access the gallery is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        handleSend("image", selectedImageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  const renderMessage = ({ item }) => {
    const isSender = item.senderId === userId;
    const isSelected = selectedMessages.includes(item._id);

    if (item.messageType === "text") {
      return (
        <Pressable
          onLongPress={() =>
            setSelectedMessages((prev) =>
              isSelected
                ? prev.filter((id) => id !== item._id)
                : [...prev, item._id]
            )
          }
          style={[
            isSender
              ? {
                  alignSelf: "flex-end",
                  backgroundColor: "#DCF8C6",
                  padding: 8,
                  maxWidth: "60%",
                  borderRadius: 7,
                  margin: 10,
                }
              : {
                  alignSelf: "flex-start",
                  backgroundColor: "white",
                  padding: 8,
                  margin: 10,
                  borderRadius: 7,
                  maxWidth: "60%",
                },
            isSelected && { backgroundColor: "#F0FFFF" },
          ]}
        >
          <Text style={{ fontSize: 13 }}>{item.message}</Text>
          <Text
            style={{
              textAlign: "right",
              fontSize: 9,
              color: "gray",
              marginTop: 5,
            }}
          >
            {formatTime(item.timeStamp)}
          </Text>
        </Pressable>
      );
    }

    if (item.messageType === "image") {
      return (
        <Pressable
          style={[
            isSender
              ? {
                  alignSelf: "flex-end",
                  backgroundColor: "#DCF8C6",
                  padding: 8,
                  maxWidth: "60%",
                  borderRadius: 7,
                  margin: 10,
                }
              : {
                  alignSelf: "flex-start",
                  backgroundColor: "white",
                  padding: 8,
                  margin: 10,
                  borderRadius: 7,
                  maxWidth: "60%",
                },
          ]}
        >
          <Image
            source={{ uri: `${BASEURL}/files/${item.imageUrl}` }}
            style={{ width: 200, height: 200, borderRadius: 7 }}
          />
          <Text
            style={{
              textAlign: "right",
              fontSize: 9,
              color: "gray",
              marginTop: 5,
            }}
          >
            {formatTime(item.timeStamp)}
          </Text>
        </Pressable>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={{ flexGrow: 1 }}
        inverted
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: "#dddddd",
          marginBottom: showEmojiSelector ? 0 : 25,
        }}
      >
        <Entypo
          onPress={() => setShowEmojiSelector((prev) => !prev)}
          name="emoji-happy"
          size={24}
          color="gray"
          style={{ marginRight: 5 }}
        />
        <TextInput
          value={message}
          onChangeText={setMessage}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "#dddddd",
            borderRadius: 20,
            paddingHorizontal: 10,
          }}
          placeholder="Type Your message..."
        />
        <Entypo onPress={pickImage} name="camera" size={24} color="gray" />
        <Pressable
          onPress={() => handleSend("text")}
          style={{
            backgroundColor: "#007bff",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            marginLeft: 5,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
        </Pressable>
      </View>

      {showEmojiSelector && (
        <EmojiSelector
          onEmojiSelected={(emoji) => setMessage((prev) => prev + emoji)}
          style={{ height: 250 }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;

const styles = StyleSheet.create({});
