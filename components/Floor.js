import Matter from "matter-js";
import React from "react";
import { Image, View } from "react-native";
import floorImg from "../assets/floor.png";

const Floor = (props) => {
  const widthBody = props.body.bounds.max.x - props.body.bounds.min.x;
  const heightBody = props.body.bounds.max.y - props.body.bounds.min.y;

  const xBody = props.body.position.x - widthBody / 2;
  const yBody = props.body.position.y - heightBody / 2;

  return (
    <View
      style={{
        position: "absolute",
        left: xBody,
        top: yBody,
        width: widthBody,
        height: heightBody,
      }}
    >
      <Image source={floorImg} style={{ width: widthBody * 2, height: 40 }} />
    </View>
  );
};

export default (world, pos, size) => {
  const initialFloor = Matter.Bodies.rectangle(
    pos.x,
    pos.y,
    size.width,
    size.height,
    { label: "Floor", isStatic: true }
  );
  Matter.World.add(world, initialFloor);

  return {
    body: initialFloor,
    pos,
    renderer: <Floor />,
  };
};
