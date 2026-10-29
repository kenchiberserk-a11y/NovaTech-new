import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "NovaTech | Secure Workspace", description: "The secure workspace for NovaTech teams." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
