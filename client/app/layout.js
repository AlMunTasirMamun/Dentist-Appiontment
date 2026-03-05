import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import NotificationWrapper from "@/components/layout/NotificationWrapper";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata = {
  title: "DentCare - Dentist Appointment Booking",
  description: "Book your dental appointments online with our expert dentists. Easy scheduling, quality care.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased bg-gray-50`}>
        <AuthProvider>
          <NotificationWrapper>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </NotificationWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
