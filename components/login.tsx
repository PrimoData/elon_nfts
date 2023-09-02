import React, { useState } from "react";
import { Signer } from "ethers";
import { connectToSmartWallet } from "../lib/wallet";
import { Connected } from "./connected";


export const Login = ({
  prompt,
  image
}: {
  prompt: string | null;
  image: string | null;
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signer, setSigner] = useState<Signer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const connectWallet = async () => {
    if (!username || !password) return;
    try {
      setIsLoading(true);
      const wallet = await connectToSmartWallet(username, password, (status) =>
        setLoadingStatus(status)
      );
      const s = await wallet.getSigner();
      setSigner(s);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      console.error(e);
      setError((e as Error).message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError(undefined); // Clear any error message when closing the modal
  };

  return username && signer ? (
    <Connected prompt={prompt} image={image} signer={signer} username={username} />
  ) : (
    <>
      <button
        className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Login / Signup
      </button>

      {showModal ? (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <button
              className="absolute top-0 right-0 m-2 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              X
            </button>
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-blue-500">Loading...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center">
                <p className="text-red-500">{error}</p>
                <button
                  className="mt-4 px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800 transition duration-150 ease-in-out"
                  onClick={() => setError(undefined)}
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="px-8 py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800 transition duration-150 ease-in-out"
                  onClick={() => connectWallet()}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};
