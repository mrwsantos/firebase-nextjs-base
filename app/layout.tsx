import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth";
import { Toaster } from "@/components/ui/sonner";
import Head from "next/head";
import SidebarNav from "@/components/Layout/SidebarNav";

export const metadata: Metadata = {
  title: "Title",
  description: "Manage your daily life",
  icons: {
    icon: "@/public/li-icon.png", // ou "/icon.png"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/dpf5tqz.css"/>
      </Head>
      <body
        className={`antialiased min-h-[100dvh] bg-muted flex`}
      >
        <AuthProvider>
          <SidebarNav/>
          {children}
          <Toaster richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}