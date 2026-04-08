import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SessionProvider } from '@/components/SessionProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Der Fluss des Lebens – Private Christliche Forschungsplattform',
  description: 'Eine private Plattform für christliche Bibelforschung, Thesen und gemeinsames Gebet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="font-sans flex flex-col min-h-screen text-gray-800">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <SpeedInsights />
        </SessionProvider>
      </body>
    </html>
  );
}
