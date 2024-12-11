"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ToastProvider from "@/hooks/Toast/Toast";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  return (
    <html lang="en">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="88772cae-85b0-454b-8e89-4ecd88907d35"></script>
        </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        <ToastProvider>
          <Provider store={store}>{children}</Provider>
        </ToastProvider>
      </body>
    </html>
  );
}
