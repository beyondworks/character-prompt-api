---

## 2. GitHub `/api/generate.js` 전체 교체

```javascript
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://chatgpt.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { input, mode = 'standard', sessionId, sequenceNumber = 1 } = req.body;
  
  const seed = sessionId ? parseInt(sessionId) % 1000000 : Math.floor(Math.random() * 1000000);
  
  const modeSettings = {
    quick: { quality: 1, ar: "16:9", style: "raw" },
    standard: { quality: 2, ar: "16:9", style: "raw" },
    cinematic: { quality: 2, ar: "21:9", style: "raw", extra: "--s 750" }
  };
  
  const settings = modeSettings[mode] || modeSettings.standard;
  
  res.status(200).json({
    prompts: {
      midjourney: `${input} --seed ${seed} --v 6.1 --q ${settings.quality} --ar ${settings.ar} --style ${settings.style} ${settings.extra || ''}`,
      kling: {
        imageToVideo: `Transform still image into dynamic ${sequenceNumber <= 2 ? 'introduction' : sequenceNumber <= 4 ? 'action' : 'conclusion'} sequence, ${mode === 'cinematic' ? 'professional' : 'standard'} mode`,
        textToVideo: input,
        settings: { mode: mode === 'cinematic' ? 'professional' : 'standard', duration: 10 }
      }
    },
    continuity: {
      sessionId: sessionId || Date.now().toString(),
      seed: seed,
      sequence: sequenceNumber,
      nextHint: `Continue with sequence ${sequenceNumber + 1}`
    }
  });
}
