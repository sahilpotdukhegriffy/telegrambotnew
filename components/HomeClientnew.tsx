"use client";

import { useState, useEffect, useCallback } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { Address } from "@ton/core";
import TelegramAuth from "@/components/TelegramAuth";

/**
 * HomeClient:
 * This component is responsible for the client-side logic, such as handling
 * TON wallet connections, and rendering session data passed from the server.
 *
 * @param {string | null} session - The session information passed from the server component.
 * @returns JSX.Element
 */
export default function HomeClient({ session }: { session: string | null }) {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * handleWalletConnection:
   * This function is called when a TON wallet is successfully connected.
   * It updates the state with the wallet address and stops the loading state.
   *
   * @param {string} address - The address of the connected wallet.
   */
  const handleWalletConnection = useCallback((address: string) => {
    setTonWalletAddress(address);
    console.log("Wallet connected successfully!");
    setIsLoading(false);
  }, []);

  /**
   * handleWalletDisconnection:
   * This function is called when the TON wallet is disconnected.
   * It clears the wallet address state and stops the loading state.
   */
  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAddress(null);
    console.log("Wallet disconnected successfully!");
    setIsLoading(false);
  }, []);

  /**
   * This hook is responsible for checking the current wallet connection status on mount and subscribing to changes in the wallet status.
   * It automatically connects or disconnects the wallet based on the connection state.
   */
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account?.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection]);

  /**
   * handleWalletAction:
   * This function handles the user action to connect or disconnect the TON wallet.
   * It toggles between connecting and disconnecting based on the current connection state.
   */
  const handleWalletAction = async () => {
    if (tonConnectUI.connected) {
      setIsLoading(true);
      await tonConnectUI.disconnect();
    } else {
      await tonConnectUI.openModal();
    }
  };

  const formatAddress = (address: string) => {
    const tempAddress = Address.parse(address).toString();
    return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-14">
      <h1 className="text-4xl font-bold mb-8">
        Sign in with Telegram using JWT
      </h1>
      <pre>{JSON.stringify(session, null, 2)}</pre> {/* Render session data */}
      <TelegramAuth />
      <h2 className="text-4xl font-bold mb-8">Connect to TON wallet</h2>
      {tonWalletAddress ? (
        <div className="flex flex-col items-center">
          <p className="mb-4">Connected: {formatAddress(tonWalletAddress)}</p>
          <button
            onClick={handleWalletAction}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <button
          onClick={handleWalletAction}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect TON Wallet
        </button>
      )}
    </main>
  );
}
