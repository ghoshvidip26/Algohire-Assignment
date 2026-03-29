import type { Metadata } from "next";
import Sidebar from "./components/Sidebar";
import "./globals.css";
import SocketProvider from "./components/SocketProvider";

export const metadata: Metadata = {
  title: "GridWatch",
  description: "Operational dashboard for power-grid sensor monitoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground font-sans">
        <SocketProvider>
          <div className="min-h-screen lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
            <Sidebar />
            <main className="min-w-0">{children}</main>
          </div>
        </SocketProvider>
      </body>
    </html>
  );
}
