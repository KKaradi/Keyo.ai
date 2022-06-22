import { Button } from "@mui/material";
import { NextPage } from "next";
import styles from "../styles/components/ConnectWallet.module.css";

const ConnectWallet: NextPage = () => {
  return (
    <Button variant="contained" className={styles.button}>
      CONNECT WALLET
    </Button>
  );
};

export default ConnectWallet;
