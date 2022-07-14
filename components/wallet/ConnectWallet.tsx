import { NextPage } from "next";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ConnectWallet: NextPage = () => {
  return <ConnectButton chainStatus="none" />;
};

export default ConnectWallet;
