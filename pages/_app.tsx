import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { colors } from "../constants/colors";

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.body.style.backgroundColor = colors.background;
  }, []);

  return <Component {...pageProps} />;
}

export default App;
