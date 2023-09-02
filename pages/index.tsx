import {
  ThirdwebNftMedia,
  useContract,
  useNFTs,
} from "@thirdweb-dev/react";
import type { NextPage } from "next";
import React, { useState } from "react";
import { Login } from "../components/login";


const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const Home: NextPage = () => {

  // AI Stuff
  interface Prediction {
    output: string[];
    status: string[];
    detail: string[];
    id: string[];
  }

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const image: string | null = prediction?.output && prediction?.output.length > 0 ? prediction?.output[prediction?.output.length - 1] : null;
  const [error, setError] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputValue = (e.target as any).prompt.value; // Extract the input value
    setPromptValue(inputValue);

    if (inputValue === null) {
      // Handle the case where inputValue is null
      setError("Input value is null");
      return;
    }
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: inputValue.replace(/mischa|Mischa/g, "TOK"),
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
      console.log({ prediction });
      setPrediction(prediction);
    }
  };


  // Fetch the NFT collection from thirdweb via it's contract address.
  const { contract: nftCollection } = useContract(
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS,
    "nft-collection"
  );

  // Load all the minted NFTs in the collection
  const { data: nfts, isLoading: loadingNfts } = useNFTs(nftCollection);

  return (
    <div className="container mx-auto">

      <h1 className="text-center font-bold text-2xl">
        Mischa AI-to-NFT Creator
      </h1>

      <form className="w-full flex" onSubmit={handleSubmit}>
        <input
          type="text"
          className="w-full px-4 py-2 rounded-l-lg border-t mr-0 border-b border-l text-gray-800 border-gray-200 bg-white"
          name="prompt"
          placeholder="Enter a prompt to generate an image of Mischa"
        />
        <button className="px-8 py-2 font-semibold rounded-r-lg border-t border-b border-r text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800 transition duration-150 ease-in-out" type="submit">
          Create Image
        </button>
      </form>

      <main className="container mx-auto">
        <div className="container mx-auto">
          <Login prompt={promptValue} image={image} />
        </div>
      </main>

      {error && <div>{error}</div>}

      {prediction && (
        <>
          {prediction.output && (
            <div className="image-wrapper mt-5">
              <img
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                width="25%"
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">Image Creation Status: {prediction.status}</p>
        </>
      )}

      <hr className="my-8" />

      <div className="container mx-auto">
        <h2 className="text-center font-bold text-2xl mb-4">Mischa AI NFT Collection:</h2>

        {loadingNfts ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {nfts?.map((nft) => (
              <div className="relative bg-white rounded-lg shadow-lg overflow-hidden" key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className="h-full w-full rounded-lg"
                />
                <div className="text-center">
                  <p className="font-bold">{nft.metadata.name}</p>
                </div>
                <div className="text-center">
                  <a href={`https://base-goerli.blockscout.com/token/${process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS}/instance/${nft.metadata.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">View on the blockchain</a>
                </div>
                <div className="text-center">
                  <p className="">Owned by: {nft.owner}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
