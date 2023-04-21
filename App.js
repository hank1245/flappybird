import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import entities from "./entities";
import Physics from "./physics";
import { useCallback, useEffect, useRef, useState } from "react";
import * as _ from "lodash";
import backgroundImg from "./assets/backgroundImg.png";
import { addDoc, collection } from "firebase/firestore";
import { firestore } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [running, setRunning] = useState(false);
  const [name, setName] = useState(null);
  const [input, setInput] = useState("");
  const engineRef = useRef();
  const [currentPoints, setCurrentPoints] = useState(0);
  const loadName = async () => {
    const name = await AsyncStorage.getItem("@name");
    console.log(name);
    if (name) setName(name);
  };
  const saveName = async () => {
    if (input.length > 2) {
      await AsyncStorage.setItem("@name", JSON.stringify(input));
      setName(input);
    }
  };
  useEffect(() => {
    setRunning(false);
    loadName();
  }, [name]);

  const savePoints = useCallback(() => {
    console.log(name);
    setRunning(false);
    engineRef.current.stop();
    addDoc(collection(firestore, "point"), {
      name,
      point: currentPoints,
    });
  }, [currentPoints]);

  const debounced = _.debounce((e) => {
    switch (e.type) {
      case "game_over":
        savePoints();
        break;
      case "new_point":
        setCurrentPoints(currentPoints + 1);
        break;
      default:
        break;
    }
  }, 50);

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={backgroundImg}
        style={styles.backgroundImage}
        resizeMode="stretch"
      />
      <GameEngine
        ref={engineRef}
        entities={entities()}
        running={running}
        systems={[Physics]}
        onEvent={debounced}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <StatusBar style="auto" hidden={true} />
      </GameEngine>
      <Text
        style={{
          textAlign: "center",
          fontSize: 40,
          fontWeight: "bold",
          margin: 20,
        }}
      >
        {currentPoints}
      </Text>
      {!name ? (
        <View style={styles.init}>
          <Text style={styles.text}>Enter Name</Text>
          <TextInput
            returnKeyType="done"
            onSubmitEditing={saveName}
            onChangeText={(payload) => setInput(payload)}
            value={input}
            placeholder={"Name"}
            style={styles.input}
          />
        </View>
      ) : !running ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "black",
              paddingHorizontal: 30,
              paddingVertical: 10,
            }}
            onPress={() => {
              setCurrentPoints(0);
              setRunning(true);
              engineRef.current.swap(entities());
            }}
          >
            <Text style={{ fontWeight: "bold", color: "white", fontSize: 30 }}>
              START GAME
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  init: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    width,
    height,
  },
  text: {
    color: "white",
    fontSize: 20,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 20,
    fontSize: 18,
    width: 120,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: width,
    height: height,
  },
});
