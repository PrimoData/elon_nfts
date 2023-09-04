import React, { useState } from "react";
import { Signer } from "ethers";
import { connectToSmartWallet } from "../lib/wallet";

interface Props {
  onLoginSuccessSigner: (signer: Signer) => void;
  onLoginSuccessUser: (username: string) => void;
}

export const Login: React.FC<Props> = ({
  onLoginSuccessSigner,
  onLoginSuccessUser,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signer, setSigner] = useState<Signer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const handleConnectWallet = async () => {
    if (!username || !password) return;
    try {
      setIsLoading(true);
      const wallet = await connectToSmartWallet(username, password, setLoadingStatus);
      const s = await wallet.getSigner();
      setSigner(s);
      setIsLoading(false);

      // Notify the parent component of a successful login
      onLoginSuccessUser(username);
      onLoginSuccessSigner(s);

    } catch (e) {
      setIsLoading(false);
      console.error(e);
      setError((e as Error).message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(undefined);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const renderLoggedIn = () => {
    return (
      <p className="font-bold">
        Welcome, {username}!
      </p>
    );
  };

  const renderLoginForm = () => {
    return (
      <>
        <button
          className="bg-black text-white px-6 py-3 rounded shadow hover:shadow-lg mr-1 mb-1"
          type="button"
          onClick={handleShowModal}
        >
          Login / Signup
        </button>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="relative bg-white p-8 rounded-xl w-96 shadow-2xl">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={handleCloseModal}
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
              <h1 className="text-4xl font-semibold mb-5">Login / Signup</h1>
              <p>Create your user credentials or enter your existing ones.</p>
              <br />
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black"></div>
                  <p className="text-black">Loading...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-red-500 font-medium">{error}</p>
                  <button
                    className="px-6 py-2 text-white bg-black rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-black"
                    onClick={() => setError(undefined)}
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full px-4 py-2 mb-4 rounded-lg border-2 border-gray-300 focus:border-black-500 focus:ring-1 focus:ring-black-200"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-2 mb-4 rounded-lg border-2 border-gray-300 focus:border-black-500 focus:ring-1 focus:ring-black-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="px-8 py-2 text-white bg-black rounded-md hover:bg-black-600 focus:outline-none focus:ring-2 focus:ring-black-200"
                    onClick={handleConnectWallet}
                  >
                    Login / Signup
                  </button>
                </div>
              )}
            </div>
          </div>

        )}
      </>
    );
  };

  return username && signer ? renderLoggedIn() : renderLoginForm();
};