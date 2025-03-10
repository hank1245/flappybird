import Matter from "matter-js";
import { getPipeSizeAndPos } from "./utils/random";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

let tick = 0;
let pose = 0;
let moving = false;
let level = 0;
let count = 0;
let collisionRegistered = false;

const physics = (entities, { touches, time, dispatch }) => {
  const engine = entities.physics.engine;

  if (!collisionRegistered) {
    Matter.Events.on(engine, "collisionStart", (e) => {
      level = 0;
      count = 0;
      dispatch({ type: "game_over" });
    });
    collisionRegistered = true;
  }

  touches
    .filter((t) => t.type === "press")
    .forEach((t) => {
      moving = true;
      Matter.Body.setVelocity(entities.Bird.body, { x: 0, y: -8 });
      setTimeout(() => {
        moving = false;
      }, 300);
    });

  for (let index = 1; index <= 2; index++) {
    if (entities[`ObstacleTop${index}`].body.bounds.max.x <= 40) {
      dispatch({ type: "new_point" });
    }

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
      count += 1;
      if (count % 4 === 0) level += 1;
    }

    Matter.Body.translate(entities[`ObstacleTop${index}`].body, {
      x: -3 - level,
      y: 0,
    });
    Matter.Body.translate(entities[`ObstacleBottom${index}`].body, {
      x: -3 - level,
      y: 0,
    });
  }

  if (entities["Floor"].body.bounds.max.x / 2 <= 0) {
    Matter.Body.setPosition(entities["Floor"].body, {
      x: width / 2,
      y: height - 20,
    });
  }

  Matter.Body.translate(entities["Floor"].body, { x: -3 - level, y: 0 });
  Matter.Engine.update(engine, time.delta);

  if (moving) {
    tick += 1;
    if (tick % 5 === 0) {
      pose = (pose + 1) % 3;
      entities.Bird.pose = pose;
    }
  } else {
    entities.Bird.pose = 0;
  }

  return entities;
};

export default physics;
