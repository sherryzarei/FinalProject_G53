import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { BASEURL } from "../constants";

const SendMessage = () => {
  const [senderId, setSenderId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [messageType, setMessageType] = useState("");
  const [messageText, setMessageText] = useState("");

  const sendMessage = async () => {
    if (!senderId || !recipientId || !messageType) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch(`${BASEURL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId,
          recipientId,
          messageType,
          messageText,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Message sent successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send a Message</Text>

      <TextInput
        style={styles.input}
        placeholder="Sender ID"
        value={senderId}
        onChangeText={setSenderId}
      />
      <TextInput
        style={styles.input}
        placeholder="Recipient ID"
        value={recipientId}
        onChangeText={setRecipientId}
      />
      <TextInput
        style={styles.input}
        placeholder="Message Type"
        value={messageType}
        onChangeText={setMessageType}
      />
      <TextInput
        style={styles.input}
        placeholder="Message Text (optional)"
        value={messageText}
        onChangeText={setMessageText}
      />

      <Button title="Send Message" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default SendMessage;
