import type { AppProps } from "next/app";
import Head from "next/head";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "./styles/globals.css";

const activeChain = "base-goerli";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      activeChain={activeChain}>
      <Head>
        <title>Elon NFTs</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="NFT collection of AI generated pictures of Elon Musk created by the community on the Base blockchain."
        />
        <meta name="keywords" content="thirdweb signature based minting" />
        <link id="favicon" rel="icon" href="https://abs.twimg.com/favicons/twitter.3.ico"></link>

      </Head>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
