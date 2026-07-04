import '../styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apex Liquidity | Autonomous Treasury Optimizer',
  description: 'AI-driven treasury yield optimization sweep engine powered by Gemini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-darkBg text-zinc-100 min-h-screen antialiased">
        {/* Glow overlay assets for premium aesthetics */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/10 via-transparent to-transparent pointer-events-none z-0" />
        <div className="absolute top-[-100px] right-[10%] w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-slow" />
        <div className="absolute top-[200px] left-[5%] w-[250px] h-[250px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none z-0" />
        
        <main className="relative z-10 min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
