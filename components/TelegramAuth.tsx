"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TelegramAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  /**
   * useEffect:
   * This hook runs once when the component mounts and checks if the user is already authenticated by calling the session API.
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * checkAuth:
   * This function checks whether the user has an active session by making an API call to "/api/session".
   * If the session is valid, it updates the state to reflect that the user is authenticated.
   */
  const checkAuth = async () => {
    const response = await fetch("/api/session");
    if (response.ok) {
      setIsAuthenticated(true);
    }
  };

  /**
   * authenticateUser:
   * This function handles the Telegram Web App authentication process. It imports the Telegram Web App SDK,
   * retrieves the initial data (initData), and sends it to the server for validation. If the authentication is successful,
   * it updates the authentication state and refreshes the page.
   */
  const authenticateUser = async () => {
    const WebApp = (await import("@twa-dev/sdk")).default;
    WebApp.ready();
    const initData = WebApp.initData;
    if (initData) {
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ initData }),
        });

        if (response.ok) {
          setIsAuthenticated(true);
          router.refresh(); // Refresh the page to reflect the authenticated state
        } else {
          console.error("Authentication failed");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        setIsAuthenticated(false);
      }
    }
  };

  /**
   * logoutUser:
   * This function handles the logout process by making a POST request to "/api/logout".
   * If successful, it updates the state to reflect that the user is no longer authenticated and refreshes the page.
   */
  const logoutUser = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsAuthenticated(false);
        router.refresh();
      } else {
        console.error("Logout failed");
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setIsAuthenticated(true);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      {isAuthenticated ? (
        <>
          <p>Authenticated!</p>
          <button
            onClick={() => router.push("/protected")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Access Protected Page
          </button>
          <button
            onClick={() => logoutUser()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            log out
          </button>
        </>
      ) : (
        <div>
          <p>You need to be an owner of this account</p>
          <button
            onClick={authenticateUser}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Authenticate
          </button>
        </div>
      )}
    </div>
  );
}
