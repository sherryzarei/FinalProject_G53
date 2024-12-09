import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

const UserType = createContext();

const UserContext = ({ children }) => {
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      setToken(token);
    } catch (error) {
      console.log("error :", error);
    }
  };
  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          console.log("User ID retrieved from AsyncStorage:", storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId from AsyncStorage:", error);
      }
    };
    getUserId();
  }, []);
  
  return (
    <UserType.Provider value={{ userId, setUserId, token, setToken }}>
      {children}
    </UserType.Provider>
  );
};

export { UserType, UserContext };
