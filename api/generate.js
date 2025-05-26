export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://chatgpt.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { input, mode = 'standard', sessionId, sequenceNumber = 1 } = req.body;
  
  // 실사화 강제 키워드
  const forceRealistic = "RAW photo, 8k uhd, film grain, Fujifilm XT3, (photorealistic:1.4), (high detailed skin:1.2), professional photograph";
  const noAnime = "(deformed, distorted, disfigured:1.3), poorly drawn, bad anatomy, wrong anatomy, anime, cartoon, illustration, painting, sketch";
  
  const seed = sessionId ? parseInt(sessionId) % 1000000 : Math.floor(Math.random() * 1000000);
  
  const finalPrompt = `${forceRealistic}, ${input}, Negative prompt: ${noAnime}`;
  
  res.status(200).json({
    prompts: {
      midjourney: `${finalPrompt} --seed ${seed} --v 6.1 --style raw --q 2`,
      kling: {
        imageToVideo: "Realistic human movement, no animation",
        textToVideo: input
      }
    },
    continuity: {
      sessionId: sessionId || Date.now().toString(),
      seed: seed
    }
  });
}
