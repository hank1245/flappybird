import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";
import { GameEngine } from "react-native-game-engine";
import entities from "./entities";
import Physics from "./physics";
import { useEffect, useRef, useState } from "react";
import * as _ from "lodash";

export default function App() {
  const [running, setRunning] = useState(false);
  const engineRef = useRef();
  const [currentPoints, setCurrentPoints] = useState(0);
  useEffect(() => {
    setRunning(false);
  }, []);
  const debounced = _.debounce((e) => {
    switch (e.type) {
      case "game over":
        setRunning(false);
        engineRef.current.stop();
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
      {!running ? (
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
