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
        className="bg-blue-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Login / Signup
      </button>

      {showModal ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-gray-900">
          <div className="relative bg-white p-6 mx-auto rounded-lg shadow-lg w-96">
            <button
              className="absolute right-5 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h1 className="text-4xl font-bold mt-8">Login/Signup</h1>
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                <p className="mt-4 text-blue-500">Loading...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center">
                <p className="text-red-500">{error}</p>
                <button
                  className="mt-4 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
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
                  className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="px-8 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                  onClick={() => connectWallet()}
                >
                  Login / Signup
                </button>
              </div>
            )}
          </div>
        </div>

      ) : null}
    </>
  );
};
