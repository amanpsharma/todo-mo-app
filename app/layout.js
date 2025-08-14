import "./globals.css";
import { AuthProvider } from "./components/auth/AuthProvider";
import HeaderAuth from "./components/auth/HeaderAuth";
import Toaster from "./components/ui/Toaster";

export const metadata = {
  title: "My Todo App",
  description: "A simple and efficient todo application built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily:
            '"Nunito Sans", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <AuthProvider>
          <div className="max-w-3xl mx-auto px-4 pt-6">
            <HeaderAuth />
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
