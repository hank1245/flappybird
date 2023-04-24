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
import Physics, { level } from "./physics";
import { useCallback, useEffect, useRef, useState } from "react";
import * as _ from "lodash";
import backgroundImg from "./assets/backgroundImg.png";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "./firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native";

const { width, height } = Dimensions.get("window");

export default function App() {
  const [running, setRunning] = useState(false);
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState();
  const [currentPoint, setCurrentPoint] = useState(0);
  const [highestPoint, setHighestPoint] = useState(0);
  const [showRank, setShowRank] = useState(false);
  const engineRef = useRef();
  const userRef = collection(firestore, "user");

  const loadName = async () => {
    const name = await AsyncStorage.getItem("@name");
    if (name) {
      setName(name);
      const _name = name.substring(1, name.length - 1);
      const q = query(userRef, where("name", "==", `${_name}`));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs[0].data();
      setHighestPoint(data["point"]);
    }
  };

  const saveName = async () => {
    if (input.length > 2) {
      const q = query(userRef, where("name", "==", `${input}`));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length === 0) {
        await AsyncStorage.setItem("@name", JSON.stringify(input));
        setName(input);
        addDoc(collection(firestore, "user"), {
          name: input,
          point: 0,
        });
      } else {
        setError("이미 존재하는 이름입니다.");
      }
    } else {
      setError("3글자 이상으로 작성해주세요.");
    }
  };

  const savePoints = useCallback(async () => {
    setRunning(false);
    engineRef.current.stop();
    const _name = name.substring(1, name.length - 1);
    const q = query(userRef, where("name", "==", `${_name}`));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs[0].data();
    if (data["point"] < currentPoint) {
      const docId = querySnapshot.docs[0].id;
      const userDocRef = doc(userRef, docId);
      updateDoc(userDocRef, { point: currentPoint });
      setHighestPoint(currentPoint);
    }
  }, [currentPoint, name]);

  const debounced = _.debounce((e) => {
    switch (e.type) {
      case "game_over":
        savePoints();
        break;
      case "new_point":
        setCurrentPoint(currentPoint + 1);
        break;
      default:
        break;
    }
  }, 50);

  useEffect(() => {
    setRunning(false);
    loadName();
  }, [name, highestPoint]);

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
        {currentPoint}
      </Text>
      <Text style={styles.highest}>최고점수 : {highestPoint}</Text>
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
          {error && <Text style={styles.error}>{error}</Text>}
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
              setCurrentPoint(0);
              setRunning(true);
              engineRef.current.swap(entities());
            }}
          >
            <Text style={{ fontWeight: "bold", color: "white", fontSize: 30 }}>
              START GAME
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.rank}>See Rank</Text>
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
  error: {
    fontSize: 20,
    fontWeight: 700,
    color: "red",
  },
  highest: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 28,
    fontWeight: 700,
  },
  rank: {
    marginTop: 30,
    marginLeft: 120,
    fontSize: 30,
    fontWeight: 700,
  },
});
