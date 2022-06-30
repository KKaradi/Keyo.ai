import { NextPage } from "next";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ConnectWallet: NextPage = () => {
  return (
    <ConnectButton chainStatus={{ smallScreen: "icon", largeScreen: "icon" }} />
  );
};

export default ConnectWallet;
