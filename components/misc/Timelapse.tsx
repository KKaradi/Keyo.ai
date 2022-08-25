import Image from "next/image";
import type { NextPage } from "next/types";
import styles from "../../styles/components/dialogs/HowToPlayDialog.module.css";

import brutalist from "../../public/timelapses/brutalist.gif";
import space from "../../public/timelapses/space.gif";
import ruins from "../../public/timelapses/ruins.gif";

const gifs = [
  { src: brutalist, alt: "Brutalist Architecture" },
  { src: space, alt: "A Nightmare in Deep Space" },
  { src: ruins, alt: "Underwater Ruins" },
];

const Timelapse: NextPage = () => {
  const { src, alt } = gifs[Math.floor(Math.random() * gifs.length)];
  return <Image src={src} alt={alt} className={styles.timelapse} />;
};
export default Timelapse;
