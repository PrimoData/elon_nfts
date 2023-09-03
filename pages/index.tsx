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
    const inputValue = `Mischa ${(e.target as any).prompt.value}`;
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
        prompt: inputValue.replaceAll("Mischa", "TOK"),
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
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 p-12 prose prose-slate font-sans">

      <h1 className="text-center">Mischa NFT Generator</h1>

      <p className="text-center lead p-0 m-0">Create your own Mischa NFTs in two simple steps.</p>

      <h3>Step 1. Generate Image</h3>
      <form className="flex" onSubmit={handleSubmit}>
        <p className="py-0 mt-5 pr-5 font-bold">Mischa </p>
        <input
          type="text"
          className="w-full px-4 py-2 rounded-l-lg border border-gray-200 bg-white text-gray-800"
          name="prompt"
          placeholder="on a mountaintop"
        />
        <button className="px-8 py-2 font-semibold rounded-r-lg bg-blue-500 text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800 transition duration-150 ease-in-out" type="submit">
          Create Image
        </button>
      </form>

      {error && <div className="text-red-500">{error}</div>}

      {prediction && (
        <>
          {prediction.output ? (
            <div className="image-wrapper mt-5">
              <img
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                className="w-1/4"
              />
            </div>
          ) : (
            <>
              <p>Image generating. This could take a minute...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p>Status: {prediction.status}</p>
            </>
          )}
        </>
      )}
      <h3>Step 2. Create NFT</h3>
      <Login prompt={promptValue} image={image} />

      <hr className="mb-0 mt-5" />

      <div className="container mx-auto">
        <h2 className="text-center">My Collection</h2>
        <p className="text-center lead">Login to see yours...</p>
      </div>

      <hr className="mb-0 mt-5" />

      <div className="container mx-auto">
        <h2 className="text-center">Complete Collection</h2>
        <p className="text-center lead">This is the complete collection of Mischa NFTs minted on the blockchain.</p>

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
                    <p className="m-1">Created by: {nft.metadata.properties?.creator}</p>
                    <a href={`https://base-goerli.blockscout.com/token/${process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS}/instance/${nft.metadata.id}`} target="_blank" className="text-blue-400 hover:text-blue-500">View on the blockchain</a>
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
