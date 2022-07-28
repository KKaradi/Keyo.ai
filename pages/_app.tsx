import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { colors } from "../constants/colors";
import RainbowKit from "../components/misc/RainbowKit";
import { GoogleOAuthProvider } from "@react-oauth/google";

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    document.body.style.backgroundColor = colors.background;
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID ?? ""}>
      <RainbowKit>
        <Component {...pageProps} />
      </RainbowKit>
    </GoogleOAuthProvider>
  );
};

export default App;
