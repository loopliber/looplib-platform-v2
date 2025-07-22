// src/app/sell-beats/page.tsx
'use client';

export default function SellBeatsPage() {
  return (
    <div 
      className="w-full min-h-screen"
      dangerouslySetInnerHTML={{
        __html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>How to Sell Beats While You Sleep - FLGang</title>
              <!-- Add your CSS and the rest of your HTML content here -->
              <!-- Copy everything from your paste.txt file starting from the <style> tag -->
          </head>
          <body>
              <!-- Copy the body content from your paste.txt file -->
          </body>
          </html>
        `
      }}
    />
  );
}