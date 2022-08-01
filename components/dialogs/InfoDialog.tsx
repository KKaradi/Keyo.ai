import { ReactElement } from "react";
import Button from "@mui/material/Button";
import styles from "../../styles/components/dialogs/InfoDialog.module.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { colors } from "../../constants/colors";
import Timelapse from "../misc/Timelapse";

type InfoDialogProps = {
  children: ReactElement;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

const InfoDialog: NextPage<InfoDialogProps> = ({
  children,
  isOpen,
  setIsOpen,
}) => {
  return (
    <div>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <Dialog
        open={isOpen}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => setIsOpen(false)}
      >
        <DialogTitle>
          <h1>How To Play</h1>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
            venenatis nisi non justo egestas interdum. Nam venenatis bibendum
            neque, vel ullamcorper eros malesuada ornare. Pellentesque lectus
            risus, lacinia sed vehicula sed, fermentum id ex. Aenean vel est ut
            nunc hendrerit pellentesque. Suspendisse eu tincidunt urna, a
            pretium nisi.
          </DialogContentText>
          <br />
          <Timelapse />
        </DialogContent>

        <Button
          variant="contained"
          className={styles.dialogButton}
          size="large"
          onClick={() => setIsOpen(false)}
          style={{
            borderRadius: 15,
            color: colors.gray,
            backgroundColor: "white",
            fontSize: "18px",
          }}
        >
          OK
        </Button>
      </Dialog>
    </div>
  );
};

export default InfoDialog;
