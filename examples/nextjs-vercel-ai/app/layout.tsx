import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebMCP + Vercel AI SDK Next.js Example',
  description: 'Connect Next.js Vercel AI SDK agents to browser content and local resources via Model Context Protocol (WebMCP)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
