// src/app/sell-beats/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Sell Beats While You Sleep - FLGang',
  description: 'The $10,000/Month Producer Blueprint',
};

export default function SellBeatsPage() {
  return (
    <div className="w-full h-screen">
      <iframe 
        src="/sell-beats-content.html"
        className="w-full h-full border-0"
        title="How to Sell Beats While You Sleep"
        style={{ 
          width: '100vw', 
          height: '100vh',
          border: 'none',
          margin: 0,
          padding: 0
        }}
      />
    </div>
  );
}