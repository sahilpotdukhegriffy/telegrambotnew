"use client";

import "./globals.css";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>TON Connect Demo</title>
      </head>
      <body>
        <TonConnectUIProvider manifestUrl="https://white-acute-guineafowl-172.mypinata.cloud/ipfs/Qmc6Ez91xbQPqkdVCK5GNRP14A28himUPLVJ7dZU5Jsu1B">
          {children}
        </TonConnectUIProvider>
      </body>
    </html>
  );
}
