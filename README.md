# LoopLib Platform

A modern sample and loop marketplace where producers can download samples for free and purchase licenses when ready to release.

## Features

- 🎵 Free sample downloads
- 💳 Three-tier licensing system (Lease, Premium, Exclusive)
- 🔍 Advanced search and filtering
- 🎨 Genre categorization (Trap, Drill, R&B, Soul)
- ❤️ Like/favorite system
- 📊 Download tracking
- 🎧 In-browser audio preview
- 💰 Stripe payment integration
- 📱 Fully responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Storage)
- **Payments**: Stripe
- **Hosting**: Vercel
- **Audio**: Web Audio API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/looplib-platform.git
cd looplib-platform
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Set up Supabase:
   - Create a new project
   - Run the SQL schema (see setup guide)
   - Create storage buckets for samples

6. Configure Stripe:
   - Add products/prices (optional)
   - Set up webhook endpoint

7. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Uploading Samples

1. Place your audio files in a `samples` directory
2. Update the metadata in `scripts/upload-samples.js`
3. Run the upload script:
```bash
npm run upload-sample
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Configure Stripe Webhook

After deployment, update your Stripe webhook URL:
```
https://your-domain.vercel.app/api/stripe/webhook
```

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── lib/             # Utilities and configs
│   ├── types/           # TypeScript types
│   └── hooks/           # Custom React hooks
├── public/              # Static assets
├── scripts/             # Utility scripts
└── supabase/           # Database migrations
```

## License Tiers

### LEASE ($29)
- MP3 320kbps
- Up to 2,500 online streams
- SoundCloud & YouTube monetization
- Must credit producer

### PREMIUM ($99)
- WAV + MP3 files
- Up to 50,000 online streams
- All streaming platforms
- Radio broadcasting rights
- No credit required

### EXCLUSIVE ($499)
- WAV + Trackouts/Stems
- Unlimited usage
- Full commercial rights
- Sample removed from store
- 100% royalty free

## API Endpoints

- `POST /api/download` - Track free downloads
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `POST /api/likes` - Toggle sample likes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, email support@looplib.com or join our Discord community.

## License

This project is proprietary software. All rights reserved.