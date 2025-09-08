import "../styles/globals.css";
import "@fontsource/poppins";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";

import type { AppProps } from "next/app";
import { Auth } from "../components/menu/Auth";
import { DisclaimerModal } from "../components/DisclaimerModal";
import Head from "next/head";
import { Nav } from "../components/menu/Nav";
import { Toolbar } from "../components/menu/Toolbar";
import { useState, useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // Check if user has already accepted the disclaimer
    const hasAcceptedDisclaimer = localStorage.getItem("heumn-disclaimer-accepted");
    if (!hasAcceptedDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem("heumn-disclaimer-accepted", "true");
    setShowDisclaimer(false);
  };

  return (
    <>
      <Head>
        <title>HUEMN AI</title>
        <meta name="title" content="HUEMN AI" />
        <meta name="description" content="HUEMN - Emotion and Expression Analysis Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-w-screen min-h-screen bg-neutral-100 dark:bg-black font-main font-thin text-neutral-800 dark:text-white">
        <Auth>
          <Nav />
          <div>
            <Component {...pageProps} />
          </div>
          <Toolbar />
        </Auth>
        
        <DisclaimerModal 
          isOpen={showDisclaimer} 
          onAccept={handleAcceptDisclaimer}
        />
      </div>
    </>
  );
}
