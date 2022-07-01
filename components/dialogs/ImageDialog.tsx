import { useState, ReactElement } from "react";
import Dialog from "@mui/material/Dialog";
import Image from "next/image";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import styles from "../../styles/components/ImageDialog.module.css";

type ImageDialogProps = {
  path: string;
  children: ReactElement;
};

const ImageDialog: NextPage<ImageDialogProps> = ({ path, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className={styles.container} onClick={() => setIsOpen(true)}>
        {children}
      </div>
      <Dialog
        open={isOpen}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => setIsOpen(false)}
        className={styles.dialogContainer}
      >
        <div className={styles.imageContainer}>
          <Image
            className={styles.image}
            src={path}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default ImageDialog;
