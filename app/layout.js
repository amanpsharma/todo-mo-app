import "./globals.css";
import { AuthProvider } from "./components/auth/AuthProvider";
import HeaderAuth from "./components/auth/HeaderAuth";
import Toaster from "./components/ui/Toaster";
import ReduxProvider from "./store/ReduxProvider";
import { Nunito_Sans } from "next/font/google";

// Optimize font loading
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "My Todo App",
  description: "A simple and efficient todo application built with Next.js",
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.ico?v=2" },
    ],
    apple: { url: "/mask-icon.svg", color: "#7C3AED" },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body className="antialiased font-nunito" suppressHydrationWarning={true}>
        <ReduxProvider>
          <AuthProvider>
            <div className="max-w-3xl mx-auto px-4 pt-6">
              <HeaderAuth />
              {children}
            </div>
            <Toaster />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
