"use client";

import { cn } from '@/lib/utils';

interface FocusQuoteProps {
  quote: string;
  show: boolean;
}

const FocusQuote = ({ quote, show }: FocusQuoteProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <p
        className={cn(
          "text-2xl md:text-3xl lg:text-4xl font-headline text-center max-w-3xl text-white text-shadow-neon-accent transition-opacity duration-1000",
          show ? "opacity-100" : "opacity-0"
        )}
      >
        {`“${quote}”`}
      </p>
    </div>
  );
};

export default FocusQuote;
