import { NextPage } from "next";
import { TokenResponse } from "@react-oauth/google";
import { Account, GmailCredentialSchema } from "../../schemas";
import { SignIn } from "../../pages";
import { Popper } from "@mui/material";
import Image from "next/image";
import styles from "../../styles/components/header/Login.module.css";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { useGoogleLogin } from "@react-oauth/google";
import google from "../../public/logins/google.svg";
import ethereum from "../../public/logins/ethereum.svg";
import { ConnectButton } from "@rainbow-me/rainbowkit";
type LoginProps = {
  signIn?: SignIn;
  anchorState: [HTMLElement | null, (el: null) => void];
  account?: Account;
  disconnect?: () => void;
};

type GoogleResult = Omit<
  TokenResponse,
  "error" | "error_description" | "error_uri"
>;

const Login: NextPage<LoginProps> = ({
  signIn,
  anchorState,
  account,
  disconnect,
}) => {
  const [anchor, setAnchor] = anchorState;

  const onSuccess = async ({ access_token }: GoogleResult) => {
    const url = "https://www.googleapis.com/oauth2/v3/userinfo";
    const headers = { Authorization: `Bearer ${access_token}` };
    const res = await fetch(url, { headers });
    if (res.status !== 200) return;

    const parsed = GmailCredentialSchema.safeParse(await res.json());
    if (parsed.success && signIn) {
      signIn(parsed.data.email, "gmail");
      setAnchor(null);
    }
  };

  const login = useGoogleLogin({ onSuccess, flow: "implicit" });

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, openAccountModal }) => {
        const content =
          account?.address || account?.email ? (
            <div className={styles.loginContainer}>
              <div
                className={styles.ethLogin}
                onClick={() => {
                  if (account.address) openAccountModal();
                  if (account.email && disconnect) disconnect();
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
  );
};

export default Login;
