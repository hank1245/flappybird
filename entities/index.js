import Matter from "matter-js";
import Bird from "./Bird";
import Floor from "./Floor";
import { Dimensions } from "react-native";
import Obstacle from "./Obstacle";
import { getPipeSizeAndPos } from "../utils/random";

const { width, height } = Dimensions.get("window");

export default (restart) => {
  let engine = Matter.Engine.create({ enableSleeping: false });
  let world = engine.world;
  engine.gravity.y = 0.91;
  const pipeSizeAndPos1 = getPipeSizeAndPos();
  const pipeSizeAndPos2 = getPipeSizeAndPos(width * 0.9);

  return {
    physics: { engine, world },
    Bird: Bird(world, 2, { x: 50, y: 300 }, { height: 40, width: 40 }),
    ObstacleTop1: Obstacle(
      world,
      "ObstacleTop1",
      pipeSizeAndPos1.pipeTop.pos,
      pipeSizeAndPos1.pipeTop.size
    ),
    Floor: Floor(
      world,
      { x: width / 2, y: height - 20 },
      { height: 40, width }
    ),
    ObstacleBottom1: Obstacle(
      world,
      "ObstacleBottom1",
      pipeSizeAndPos1.pipeBottom.pos,
      pipeSizeAndPos1.pipeBottom.size
    ),

    ObstacleTop2: Obstacle(
      world,
      "ObstacleTop2",
      pipeSizeAndPos2.pipeTop.pos,
      pipeSizeAndPos2.pipeTop.size
    ),
    ObstacleBottom2: Obstacle(
      world,
      "ObstacleBottom2",
      pipeSizeAndPos2.pipeBottom.pos,
      pipeSizeAndPos2.pipeBottom.size
    ),
  };
};
