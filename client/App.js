import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import StackNavigator from "./StackNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserContext } from "./screens/UserContext.js";

export default function App() {
  return (
    <UserContext>
      <GestureHandlerRootView>
        <StackNavigator />
      </GestureHandlerRootView>
    </UserContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
