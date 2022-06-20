import { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/ImageCarousel.module.css";

type ImageCarouselProps = {
  paths: string[];
};

const ImageCarousel: NextPage<ImageCarouselProps> = ({ paths }) => {
  const img = styles.image;

  const images = paths.map((path, index) => (
    <div className={styles.imageContainer} key={index}>
      <Image className={img} width="100%" height="100%" src={path} alt="" />
    </div>
  ));

  return <div className={styles.imageRowContainer}> {images} </div>;
};

export default ImageCarousel;
