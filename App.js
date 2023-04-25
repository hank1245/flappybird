import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  Image,
  Pressable,
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
import { Entypo } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
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
  const [ranksData, setRanksData] = useState([]);
  const engineRef = useRef();
  const userRef = collection(firestore, "user");

  const loadName = async () => {
    const name = await AsyncStorage.getItem("@name");
    if (name) {
      setName(name);
      const p = await AsyncStorage.getItem("@point");
      setHighestPoint(JSON.parse(p));
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
      await AsyncStorage.setItem("@point", JSON.stringify(currentPoint));
    }
  }, [currentPoint, name]);

  const getRanks = async () => {
    setShowRank(true);
    const ranksArr = [];
    const q = query(userRef, orderBy("point", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc) => ranksArr.push(doc.data()));
    setRanksData(ranksArr);
  };

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
      <Text style={styles.highest}>최고기록 : {highestPoint}</Text>
      {!name ? (
        <View style={styles.init}>
          <Text style={styles.text}>Enter Nickname</Text>
          <TextInput
            returnKeyType="done"
            onSubmitEditing={saveName}
            onChangeText={(payload) => setInput(payload)}
            value={input}
            placeholder={"Nickname"}
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
              게임 시작!
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={getRanks}>
            <Text style={styles.rank}>순위 보기</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {showRank && (
        <View style={styles.rankList}>
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={styles.title}>순위</Text>
              <Pressable
                onPress={() => {
                  setShowRank(false);
                }}
                style={{ position: "relative", right: -80 }}
              >
                <Entypo name="cross" size={48} color="orange" />
              </Pressable>
            </View>
            {ranksData &&
              ranksData.map((data, idx) => {
                return (
                  <View key={idx} style={styles.row}>
                    <Text style={styles.user}>
                      {idx + 1}. {data.name}
                    </Text>
                    <Text style={styles.user}>{data.point}</Text>
                  </View>
                );
              })}
          </View>
        </View>
      )}
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
    top: 5,
    left: 5,
    fontSize: 20,
    fontWeight: 700,
  },
  rank: {
    marginTop: 15,
    marginLeft: 100,
    fontSize: 26,
    fontWeight: 700,
  },
  rankList: {
    width: 360,
    height: 480,
    backgroundColor: "rgba(60,60,60,1)",
    position: "absolute",
    top: height / 2 - 240,
    left: width / 2 - 180,
    borderRadius: 22,
  },
  title: {
    fontSize: 54,
    color: "white",
    marginLeft: 50,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 50,
    marginTop: 8,
    justifyContent: "space-between",
  },
  user: {
    color: "white",
    fontSize: 24,
  },
});
