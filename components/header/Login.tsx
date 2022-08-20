import { NextPage } from "next";
import {
  CredentialResponse,
  TokenResponse,
  useGoogleOneTapLogin,
} from "@react-oauth/google";
import {
  Account,
  GmailCredentialSchema,
  GmailResponseSchema,
} from "../../schemas";
import { SignIn } from "../../pages";
import { Popper } from "@mui/material";
import Image from "next/image";
import styles from "../../styles/components/header/Login.module.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { useGoogleLogin } from "@react-oauth/google";
import google from "../../public/logins/google.svg";
import ethereum from "../../public/logins/ethereum.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ToolTip from "./ToolTip";
import { useState } from "react";

type GoogleResult = Omit<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;

type LoginProps = {
  signIn?: SignIn;
  account?: Account;
  disconnect?: () => Promise<void>;
};

const parseJWT = (token: string) => {
  const raw = Buffer.from(token.split(".")[1], "base64").toString();
  const parsed = GmailCredentialSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
};

const Login: NextPage<LoginProps> = ({ signIn, account, disconnect }) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const onLoginClick = ({ currentTarget }: React.MouseEvent<HTMLElement>) => {
    setAnchor(anchor ? null : currentTarget);
  };

  const onSuccess = async ({ access_token }: GoogleResult) => {
    const url = "https://www.googleapis.com/oauth2/v3/userinfo";
    const headers = { Authorization: `Bearer ${access_token}` };
    const res = await fetch(url, { headers });
    if (res.status !== 200) return;

    const parsed = GmailResponseSchema.safeParse(await res.json());
    if (parsed.success && signIn) {
      signIn(parsed.data.email, "EMAIL");
      setAnchor(null);
    }
  };

  const onOneTapSuccess = async ({ credential }: CredentialResponse) => {
    if (!credential) return;

    const parsedJWT = parseJWT(credential);
    if (parsedJWT && signIn) {
      signIn(parsedJWT.email, "EMAIL");
      setAnchor(null);
    }
  };

  const login = useGoogleLogin({ onSuccess, flow: "implicit" });
  useGoogleOneTapLogin({ onSuccess: onOneTapSuccess });

  const placement = anchor ? "top" : undefined;

  return (
    <div>
      <div onClick={onLoginClick}>
        <ToolTip title="My Profile" placement={placement}>
          <AccountCircleIcon fontSize="large" />
        </ToolTip>
        <ConnectButton.Custom>
          {({ openConnectModal, openAccountModal }) => {
            const content =
              account?.type !== "COOKIE" ? (
                <div className={styles.loginContainer}>
                  <div
                    className={styles.ethLogin}
                    onClick={() => {
                      if (account?.type === "EMAIL" && disconnect) disconnect();
                      else if (account?.type === "WALLET") openAccountModal();
                    }}
                  >
                    <DoNotDisturbIcon />
                  </div>
                </div>
              ) : (
                <div className={styles.loginContainer}>
                  <div onClick={() => login()} className={styles.googleLogin}>
                    <Image
                      src={google}
                      width={30}
                      height={30}
                      alt={"Login with Google"}
                      priority
                    />
                  </div>
                  <div className={styles.ethLogin}>
                    <Image
                      src={ethereum}
                      onClick={openConnectModal}
                      width={37}
                      height={37}
                      alt={"Connect ETH Wallet"}
                      priority
                    />
                  </div>
                </div>
              );
            return (
              <Popper open={Boolean(anchor)} anchorEl={anchor}>
                {content}
              </Popper>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
};

export default Login;
