import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathforms!",
  description: "Nielsen Transform Visulization & Game Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
