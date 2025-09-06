import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chatbot",
  description: "Chatbot built with Next.js and Bootstrap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              AI Chatbot
            </a>
          </div>
        </nav>
        <main className="container my-4">{children}</main>
      </body>
    </html>
  );
}
