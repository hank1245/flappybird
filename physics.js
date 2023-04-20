import Matter from "matter-js";
import { getPipeSizeAndPos } from "./utils/random";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

const physics = (entities, { touches, time, dispatch }) => {
  let engine = entities.physics.engine;
  touches
    .filter((t) => t.type === "press")
    .forEach((t) => {
      Matter.Body.setVelocity(entities.Bird.body, {
        x: 0,
        y: -8,
      });
    });

  for (let index = 1; index <= 2; index++) {
    if (entities[`ObstacleTop${index}`].body.bounds.max.x <= 0) {
      const pipeSizePos = getPipeSizeAndPos(width * 0.9);

      Matter.Body.setPosition(
        entities[`ObstacleTop${index}`].body,
        pipeSizePos.pipeTop.pos
      );
      Matter.Body.setPosition(
        entities[`ObstacleBottom${index}`].body,
        pipeSizePos.pipeBottom.pos
      );
    }

    Matter.Body.translate(entities[`ObstacleTop${index}`].body, {
      x: -3,
      y: 0,
    });
    Matter.Body.translate(entities[`ObstacleBottom${index}`].body, {
      x: -3,
      y: 0,
    });
  }
  Matter.Events.on(engine, "collisionStart", (e) => {
    dispatch({ type: "game over" });
  });

  Matter.Engine.update(engine, time.delta);
  return entities;
};

export default physics;
