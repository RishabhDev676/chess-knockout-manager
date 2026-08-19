import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '../components/ui/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Monsoon Chess Knockout Manager',
  description: 'College Knockout Chess Tournament Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950`}>
        <Navbar />
        <main className="min-h-[calc(100vh-65px)]">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4">
            Monsoon Sports Chess Tournament 2026 &bull; Real-time Knockout System
          </div>
        </footer>
      </body>
    </html>
  );
}
