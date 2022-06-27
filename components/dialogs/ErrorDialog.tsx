import Dialog from "@mui/material/Dialog";
import type { NextPage } from "next/types";
import Alert from "@mui/material/Alert";
import SlideTransition from "./SlideTransition";

type ErrorDialogProps = {
  text: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

const ErrorDialog: NextPage<ErrorDialogProps> = ({
  text,
  isOpen,
  setIsOpen,
}) => {
  return (
    <div>
      <Dialog
        open={isOpen}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => setIsOpen(false)}
      >
        <Alert severity="warning">{text}</Alert>
      </Dialog>
    </div>
  );
};

export default ErrorDialog;
