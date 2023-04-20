import { Dimensions } from "react-native";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;

export const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
export const getPipeSizeAndPos = (addToPosX = 0) => {
  let yPosTop = -getRandom(300, windowHeight - 100);

  const pipeTop = {
    pos: { x: windowWidth + addToPosX, y: yPosTop },
    size: { height: windowHeight * 2, width: 60 },
  };
  const pipeBottom = {
    pos: { x: windowWidth + addToPosX, y: windowHeight * 2 + 240 + yPosTop },
    size: { height: windowHeight * 2, width: 60 },
  };

  return { pipeTop, pipeBottom };
};
