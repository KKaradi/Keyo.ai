import { NextPage } from "next";
import Image from "next/image";
import styles from "../../styles/components/multiwordle/ImageFrame.module.css";

type ImageFrameProps = {
  path: string;
};

const ImageFrame: NextPage<ImageFrameProps> = ({ path }) => {
  return (
    <div className={styles.frame}>
      <div className={styles.image}>
        <Image
          src={path}
          alt={""}
          width={14}
          height={10}
          layout="responsive"
          quality={100}
        />
      </div>
    </div>
  );
};

export default ImageFrame;
