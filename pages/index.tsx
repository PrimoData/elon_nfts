import type { NextPage } from "next";
import Image from "next/image";
import React, { useState } from "react";
import {
  ThirdwebNftMedia,
  useContract,
  useNFTs,
} from "@thirdweb-dev/react";
import { Signer } from "ethers";
import { Login } from "../components/login";
import { MintNFT } from "../components/mintnft";

interface Prediction {
  output: string[];
  status: string[];
  detail: string[];
  id: string[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const Home: NextPage = () => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const image = prediction?.output?.[prediction?.output?.length - 1] ?? null;
  const [error, setError] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [signer, setSigner] = useState<Signer | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputValue = `Elon ${(e.target as any).prompt.value}`;
    setPromptValue(inputValue);

    if (!inputValue) {
      setError("Input value is null");
      return;
    }

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: inputValue.replaceAll("Elon", "TOK"),
      }),
    });

    let prediction = await response.json();

    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }

    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();

      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }

      setPrediction(prediction);
    }
  };

  const { contract: nftCollection } = useContract(
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS!,
    "nft-collection"
  );

  const { data: nfts, isLoading: loadingNfts } = useNFTs(nftCollection);

  return (
    <>
      <div className="p-4 font-sans">
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-black text-2xl font-semibold">Elon NFTs</p>
        </div>
      </div>

      <div className="relative flex flex-col justify-center overflow-hidden bg-gray-100 p-12 text-gray-800">
        <div className="text-center prose prose-slate font-sans z-10">
          <h1 className="text-5xl font-extrabold leading-tight mb-4">Elon NFT Generator</h1>
          <p className="text-lg leading-relaxed">
            Create your own Elon NFT in two easy steps by first generating an image,
            then minting the NFT.*
          </p>
          <p className="text-sm italic">*Login required.</p>

          <div className="bg-white rounded-lg shadow-lg">

            <form className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 pt-4 px-4" onSubmit={handleSubmit}>
              <label className="font-semibold text-lg text-gray-700 mb-2 md:mb-0">Elon...</label>
              <input
                type="text"
                className="flex-grow px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                name="prompt"
                placeholder="on a mountaintop"
              />
              <button type="submit" className="px-8 py-2 text-white bg-black rounded-md hover:shadow-lg md:w-auto">
                Create Image
              </button>
            </form>


            <div className="image-wrapper mt-0 flex flex-col justify-center items-center bg-white pt-0 mt-0 pb-5 rounded-lg shadow-xl">

              {/* Error Message */}
              {error && <div className="text-red-600 text-lg font-medium mb-4">{error}</div>}

              {/* Prediction Output */}
              {prediction && (
                <>
                  {prediction.output ? (
                    <Image
                      src={prediction.output[prediction.output.length - 1]}
                      alt="Generated NFT Image"
                      width={300}
                      height={300}
                      className="rounded-lg mb-4"
                    />
                  ) : (
                    <div className="flex flex-col items-center mt-4 space-y-4">
                      <p className="text-lg font-semibold text-gray-800">Creating your image. Please wait ~1 minute...</p>
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                      <p className="text-sm text-gray-600">Status: <span className="text-blue-600 font-semibold">{prediction.status}</span></p>
                    </div>
                  )}
                </>
              )}

              {/* Buttons */}
              <div className="flex flex-col items-center mt-4 space-y-4">
                {signer ? (
                  <MintNFT prompt={promptValue} image={image} signer={signer} username={username} />
                ) : (
                  // <button
                  //   className="bg-black text-white text-sm px-6 py-3 rounded-md shadow-lg cursor-not-allowed mx-auto max-w-xs opacity-60"
                  //   type="button"
                  //   disabled
                  // >
                  //   Login to Mint NFT
                  // </button>
                  <Login onLoginSuccessSigner={setSigner} onLoginSuccessUser={setUsername} />
                )}
              </div>
            </div>

          </div>

        </div>
      </div>


      <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 px-12 pb-12 prose prose-slate font-sans">
        <div className="container mx-auto">
          <h2 className="text-center">Elon NFT Collection</h2>
          <p className="text-center lead">Complete collection of Elon NFTs minted on the Base blockchain.</p>

          {loadingNfts ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.isArray(nfts) &&
                [...nfts].reverse().map((nft) => (
                  <div className="relative bg-white shadow-xl ring-1 ring-gray-900/5 sm:rounded-lg" key={nft.metadata.id.toString()}>
                    <ThirdwebNftMedia
                      metadata={nft.metadata}
                      className="h-full w-full mx-auto p-2 m-0"
                    />
                    <div className="text-center mb-4">
                      <h3 className="m-2">{nft.metadata.name}</h3>
                      {nft.metadata.properties && 'creator' in nft.metadata.properties && <p className="m-1">Created by: {(nft.metadata.properties.creator as string)}</p>}
                      <a href={`https://base-goerli.blockscout.com/token/${process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS}/instance/${nft.metadata.id}`} target="_blank" className="text-blue-400 hover:text-blue-500">View on the blockchain</a>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

    </>
  );
};

export default Home;