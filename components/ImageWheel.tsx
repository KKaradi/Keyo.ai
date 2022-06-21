import { NextPage } from "next";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/ImageWheel.module.scss";

type ImageWheelProps = {
  paths: string[];
};

const ImageWheel: NextPage<ImageWheelProps> = ({ paths }) => {
  const [isPaused, setIsPaused] = useState(false);

  const style = {
    animationPlayState: isPaused ? "paused" : "running",
  };

  const images = paths.map((path, index) => (
    <li key={index}>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={styles.imageContainer}
        style={style}
      >
        <Image src={path} layout="fill" alt="" />
      </div>
    </li>
  ));

  return (
    <ul className={styles.circleContainer} style={style}>
      {images}
    </ul>
  );
};

export default ImageWheel;
