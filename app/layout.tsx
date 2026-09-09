import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'K3RITO // SHADOWFALL', description: '34-stage 2D action RPG with a 120-skill progression tree.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
