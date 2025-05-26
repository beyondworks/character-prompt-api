export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://chatgpt.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { input, mode = 'standard', sessionId, sequenceNumber = 1 } = req.body;
  
  const seed = sessionId ? parseInt(sessionId) % 1000000 : Math.floor(Math.random() * 1000000);
  
  const modeSettings = {
    quick: "--v 6.1 --style raw --ar 16:9",
    standard: "--v 6.1 --style raw --ar 16:9 --q 2",
    cinematic: "--v 6.1 --style raw --ar 21:9 --q 2 --s 750"
  };
  
  res.status(200).json({
    prompts: {
      midjourney: `${input} --seed ${seed} ${modeSettings[mode]}`,
      kling: {
        imageToVideo: "Transform to realistic human movement",
        textToVideo: input,
        settings: { 
          mode: mode === 'cinematic' ? 'professional' : 'standard',
          duration: 10 
        }
      }
    },
    continuity: {
      sessionId: sessionId || Date.now().toString(),
      seed: seed,
      sequence: sequenceNumber
    }
  });
}
