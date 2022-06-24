import { Ref, forwardRef, useState, ReactElement } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import type { NextPage } from "next/types";

const Transition = forwardRef(
  (
    props: TransitionProps & {
      children: ReactElement;
    },
    ref: Ref<unknown>
  ) => {
    return <Slide direction="up" ref={ref} {...props} />;
  }
);

type InfoDialogProps = {
  children: React.ReactElement;
};

const InfoDialog: NextPage<InfoDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setIsOpen(false)}
      >
        <DialogTitle>What Am I Looking At?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Short answer is: you'll see. We're working on some pretty cool stuff
            right now, but it's not quite ready to be released yet. In the
            meantime, connect your wallet and try your hand at voting. Who
            knows, there might be something in for you at the end of all this.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InfoDialog;
