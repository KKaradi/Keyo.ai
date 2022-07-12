import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { colors } from "../constants/colors";
import RainbowKit from "../components/misc/RainbowKit";

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    document.body.style.backgroundColor = colors.background;
  }, []);

  return (
    <RainbowKit>
      <Component {...pageProps} />
    </RainbowKit>
  );
};

export default App;
