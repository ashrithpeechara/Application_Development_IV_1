import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.scss';
import { SimulationProvider } from '@/context/SimulationContext';
import { Navbar } from '@/components/Navbar';
import { CognitiveCopilot } from '@/components/CognitiveCopilot';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'C-ASA Network Control Center — Cognitive Autonomic Simulation',
  description: 'Live interactive simulation demonstration of Cognitive Autonomic Networking (C-ASA) with multi-agent orchestration, telemetry, risk evaluation, and dynamic routing adaptation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <SimulationProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 64px)', padding: '1.25rem 1.5rem 2.5rem 1.5rem' }}>
            {children}
          </main>
          <CognitiveCopilot />
        </SimulationProvider>
      </body>
    </html>
  );
}


