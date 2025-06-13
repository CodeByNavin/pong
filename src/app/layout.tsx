import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pong Online",
  description: "Play Pong Online with friends in real-time or one device.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-primary text-secondary h-screen">
        {children}
      </body>
    </html>
  );
}
