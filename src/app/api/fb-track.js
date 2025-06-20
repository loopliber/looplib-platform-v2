// pages/api/fb-track.js

export default async function handler(req, res) {
  const pixelId = process.env.FB_PIXEL_ID; // 774623521386437
  const accessToken = process.env.FB_ACCESS_TOKEN;

  const eventTime = Math.floor(Date.now() / 1000);

  const body = {
    data: [
      {
        event_name: 'Purchase',
        event_time: eventTime,
        action_source: 'website',
        user_data: {
          em: ['HASHED_EMAIL_HERE'], // SHA-256 hash, lowercase, trimmed
          ph: [null], // or phone hash
        },
        custom_data: {
          currency: 'USD',
          value: '142.52',
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('Facebook CAPI Error:', error);
    res.status(500).json({ error: 'Failed to send event' });
  }
}
