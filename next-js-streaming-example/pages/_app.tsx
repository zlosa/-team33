import "../styles/globals.css";
import "@fontsource/poppins";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";

import type { AppProps } from "next/app";
import { Auth } from "../components/menu/Auth";
import Head from "next/head";
import { Nav } from "../components/menu/Nav";
import { Toolbar } from "../components/menu/Toolbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
    <Head>
  <title>HUEMN AI</title>
  <meta name="title" content="HUEMN AI" />
  <meta name="description" content="HUEMN" />
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
      </div>
    </>
  );
}
