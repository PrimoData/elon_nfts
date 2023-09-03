import {
  useAddress,
  ThirdwebSDKProvider,
  useContract,
  Web3Button
} from "@thirdweb-dev/react";
import { Signer } from "ethers";


const activeChain = "base-goerli";

export const Connected = ({
  prompt,
  image,
  username,
  signer,
}: {
  prompt: string | null;
  image: string | null;
  username: string;
  signer: Signer;
}) => {

  return (
    <ThirdwebSDKProvider
      signer={signer}
      activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
    >
      <ConnectedInner username={username} prompt={prompt} image={image} />
    </ThirdwebSDKProvider>
  );
};


const ConnectedInner = ({
  prompt,
  image,
  username,
}: {
  prompt: string | null;
  image: string | null;
  username: string;
}) => {
  const address = useAddress();
  const { contract: nftCollection } = useContract(
    process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS!,
    "nft-collection"
  );

  //This function calls a Next JS API route that mints an NFT with signature-based minting.
  const mintWithSignature = async () => {
    try {

      // Check if prediction is null before accessing its properties
      if (image === null) {
        console.error("Prediction is null");
        return;
      }

      const signedPayloadReq = await fetch(`/api/server`, {
        method: "POST",
        body: JSON.stringify({
          authorAddress: address,
          nftName: prompt,
          imagePath: image,
          username: username,
        }),
      });

      // Grab the JSON from the response
      const json = await signedPayloadReq.json();

      if (!signedPayloadReq.ok) {
        alert(json.error);
      }

      // Parse the signed payload from the response and store it in a variable called signedPayload.
      const signedPayload = json.signedPayload;

      // Call signature.mint and pass in the signed payload that we received, allowing the user to mint an NFT.
      const nft = await nftCollection?.signature.mint(signedPayload);

      alert("Minted succesfully!");

      return nft;
    } catch (e) {
      console.error("An error occurred trying to mint the NFT:", e);
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold mt-8">
        Welcome, {username} <br />
      </h1>
      <Web3Button
        contractAddress={process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS!}
        action={() => mintWithSignature()}
        {...(image ? null : { isDisabled: true })}
      >
        Create NFT
      </Web3Button>

    </>
  );
};
