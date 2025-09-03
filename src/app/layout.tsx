import type { Metadata } from 'next';
import { VT323 } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

const fontBody = VT323({
  subsets: ['latin'],
  variable: '--font-body',
  weight: '400',
});

export const metadata: Metadata = {
  title: 'FocusFlow Retro',
  description: 'A retro-inspired Pomodoro and Lofi music app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("font-body antialiased", fontBody.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
