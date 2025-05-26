export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, mode = 'standard' } = req.body;

  const response = {
    prompts: {
      midjourney: `Photorealistic ${input}, cinematic lighting, 8k detail --v 6.1 --style raw --ar 16:9`,
      kling: `${input} in dynamic motion, professional cinematography`
    },
    sessionId: Date.now().toString(),
    mode: mode
  };

  res.status(200).json(response);
}
