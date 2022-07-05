import DialogTitle from "@mui/material/DialogTitle";
import { useState, ReactElement } from "react";
import type { NextPage } from "next/types";
import SlideTransition from "./SlideTransition";
import { Dialog, DialogContent } from "@mui/material";
import { get } from "../../helpers";
import type { Response } from "../../pages/api/get/leaderboard";

type LeaderboardDialogProps = {
  children: ReactElement;
};

const LeaderboardDialog: NextPage<LeaderboardDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState<Response["addresses"]>([]);

  const openLeaderboard = async () => {
    const result = await get("/api/get/leaderboard");
    if (result.status != 200) return;

    const { addresses: addressList } = (await result.json()) as Response;
    setAddresses(addressList);
    setIsOpen(true);
  };

  return (
    <div>
      <div onClick={openLeaderboard}>{children}</div>
      <Dialog
        open={isOpen}
        TransitionComponent={SlideTransition}
        keepMounted
        onClose={() => setIsOpen(false)}
      >
        <DialogTitle>Vote Leaderboard</DialogTitle>
        <DialogContent>
          {addresses.map(({ walletAddress, votes }, index) => (
            <p>
              {index + 1}) {walletAddress}: {votes}
            </p>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaderboardDialog;
