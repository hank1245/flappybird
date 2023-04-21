import Matter from "matter-js";
import React from "react";
import { Image, View, Animated } from "react-native";
import birdImg from "../assets/birdImg.png";
import birdImg2 from "../assets/birdImg2.png";
import birdImg3 from "../assets/birdImg3.png";

const Bird = (props) => {
  const animatedValue = new Animated.Value(props.body.velocity.y);
  const widthBody = props.body.bounds.max.x - props.body.bounds.min.x;
  const heightBody = props.body.bounds.max.y - props.body.bounds.min.y;

  const xBody = props.body.position.x - widthBody / 2;
  const yBody = props.body.position.y - heightBody / 2;
  const pose = props.pose;

  const images = [birdImg, birdImg2, birdImg3];

  let rotation = animatedValue.interpolate({
    inputRange: [-8, 0, 8, 12],
    outputRange: ["-20deg", "0deg", "20deg", "45deg"],
    extrapolate: "clamp",
  });

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
      <Animated.Image
        source={images[pose]}
        style={{ width: 60, height: 50, transform: [{ rotate: rotation }] }}
      />
    </View>
  );
};

export default (world, pose, pos, size) => {
  const initialBird = Matter.Bodies.rectangle(
    pos.x,
    pos.y,
    size.width,
    size.height,
    { label: "Bird" }
  );
  Matter.World.add(world, initialBird);

  return {
    body: initialBird,
    pose,
    pos,
    renderer: <Bird />,
  };
};
