import { useState, ReactElement } from "react";
import Dialog from "@mui/material/Dialog";
import Image from "next/image";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import styles from "../../styles/components/ImageDialog.module.css";
import DownloadIcon from "@mui/icons-material/Download";

type ImageDialogProps = {
  path: string;
  imageId: string;
  children: ReactElement[] | ReactElement;
};

const ImageDialog: NextPage<ImageDialogProps> = ({
  path,
  imageId,
  children,
}) => {
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
        sx={{ backdropFilter: "blur(5px)" }}
      >
        <div className={styles.imageContainer}>
          <Image
            className={styles.image}
            src={path}
            layout="fill"
            objectFit="cover"
            alt="Image Dialog"
          />
          <div className={styles.overlay}>
            <a href={`/choice/${imageId}.jpg`} download={true}>
              <DownloadIcon fontSize="large" className={styles.download} />
            </a>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ImageDialog;
