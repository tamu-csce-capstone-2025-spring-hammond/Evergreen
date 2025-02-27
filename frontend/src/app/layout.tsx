import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evergreen",
  description: "Money really does grow on trees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward" /></head>
      <body className="font-raleway bg-evergray-100 text-evergray-800 dark:text-evergray-100">
        {children}
      </body>
    </html>
  );
}
