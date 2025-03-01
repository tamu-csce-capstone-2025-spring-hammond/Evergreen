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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body className="font-raleway bg-evergray-100 text-evergray-800 dark:text-evergray-100 dark:bg-evergray-700">
        {children}
      </body>
    </html>
  );
}
