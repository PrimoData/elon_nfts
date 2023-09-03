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
        <title>Mischa NFT Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="thirdweb Example Repository to Showcase signature based minting on an NFT Collection contract"
        />
        <meta name="keywords" content="thirdweb signature based minting" />
        <link id="favicon" rel="icon" href="https://spng.pngfind.com/pngs/s/67-672131_attentive-cat-silhouette-cat-with-long-tail-silhouette.png"></link>

      </Head>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
