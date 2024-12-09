import React, { useContext } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { UserType } from '../screens/UserContext';
import { useNavigation } from '@react-navigation/native';
import { BASEURL } from '../constants';

const FriendRequest = ({ item, friendRequests, setFriendRequests }) => {
  const { userId } = useContext(UserType);
  const navigation = useNavigation();

  const acceptRequest = async (friendRequestId) => {
    console.log('Accepting friend request for ID:', friendRequestId);
    try {
      const response = await fetch(`${BASEURL}/friend-request/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: friendRequestId,
          recipientId: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Friend request accepted:', data);
        setFriendRequests(
          friendRequests.filter((request) => request._id !== friendRequestId)
        );
        navigation.navigate('Chats');
      } else {
        console.error('Failed to accept friend request:', response.status);
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  // Construct the image URL if the user has an image
  const imageUrl = item.image ? `${BASEURL}/user/${item._id}/image` : null;

  return (
    <Pressable style={styles.container}>
      <Image
        style={styles.image}
        source={
          imageUrl
            ? { uri: imageUrl }
            : require('../assets/placeholder.jpg') // Local placeholder image
        }
        onError={() => {
          console.warn(`Failed to load image for user: ${item._id}`);
        }}
      />
      <Text style={styles.text}>
        {item?.name} sent you a friend request!
      </Text>
      <Pressable
        onPress={() => acceptRequest(item._id)}
        style={styles.acceptButton}
      >
        <Text style={styles.acceptButtonText}>Accept</Text>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#0066b2',
    padding: 10,
    borderRadius: 6,
  },
  acceptButtonText: {
    textAlign: 'center',
    color: 'white',
  },
});

export default FriendRequest;
