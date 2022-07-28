import { NextPage } from "next";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { GmailCredentialSchema } from "../../pages/api/schemas";
import { SignIn } from "../../pages";

const parseJWT = (token: string) => {
  const raw = Buffer.from(token.split(".")[1], "base64").toString();
  const parsed = GmailCredentialSchema.safeParse(JSON.parse(raw));
  return parsed.success ? parsed.data : null;
};

const accountStatus = {
  smallScreen: "address",
  largeScreen: "address",
} as const;

const chainStatus = {
  smallScreen: "none",
  largeScreen: "none",
} as const;

type LoginProps = {
  signIn?: SignIn;
};

const Login: NextPage<LoginProps> = ({ signIn }) => {
  const onGmailSuccess = ({ credential }: CredentialResponse) => {
    if (!credential) return;
    const parsed = parseJWT(credential);
    if (parsed && signIn) signIn(parsed.email, "gmail");
  };

  const onGmailError = () => {
    console.log("Login Failed");
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
      <ConnectButton
        showBalance={false}
        accountStatus={accountStatus}
        chainStatus={chainStatus}
      />
      <GoogleLogin
        onSuccess={onGmailSuccess}
        onError={onGmailError}
        auto_select
        useOneTap
      />
    </div>
  );
};

export default Login;
