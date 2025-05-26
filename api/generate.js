// 완전한 영상 제작 워크플로우 API
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { input, mode = 'standard', sequenceNumber = 1, sessionId } = req.body;
  
  // 세션 기반 시드 (일관성)
  const seed = sessionId ? parseInt(sessionId) % 1000000 : Math.floor(Math.random() * 1000000);
  
  // 5단계 시퀀스 액션
  const sequences = {
    1: { action: "standing face off", kling: "slow tension building, camera push in" },
    2: { action: "power charging up", kling: "energy swirling, hair and clothes moving" },
    3: { action: "launching attacks", kling: "fast motion, impact frames, speed lines" },
    4: { action: "attacks colliding", kling: "shockwave explosion, debris flying" },
    5: { action: "aftermath scene", kling: "dust settling, one standing victorious" }
  };
  
  const currentSeq = sequences[sequenceNumber];
  
  // 실사화 프롬프트 구성
  const midjourneyPrompt = `hyper-realistic cinematic photo of ${input}, ${currentSeq.action}, photographed with ARRI Alexa --seed ${seed} --v 6.1 --style raw --ar 21:9`;
  
  // Kling AI 프롬프트
  const klingPrompts = {
    imageToVideo: `${currentSeq.kling}, professional cinematography, 10 seconds, high performance mode`,
    textToVideo: `Live action movie scene: ${input} ${currentSeq.action}, ${currentSeq.kling}`,
    cameraWork: sequenceNumber <= 2 ? "static to slow zoom" : "dynamic tracking shot"
  };
  
  res.status(200).json({
    sequence: {
      current: sequenceNumber,
      total: 5,
      description: currentSeq.action
    },
    prompts: {
      midjourney: midjourneyPrompt,
      kling: klingPrompts
    },
    continuity: {
      sessionId: sessionId || Date.now().toString(),
      seed: seed,
      nextCommand: `sequenceNumber: ${sequenceNumber + 1}`
    },
    workflow: [
      "1. 미드저니로 이미지 생성",
      "2. Kling I2V로 영상 변환", 
      "3. 다음 시퀀스 연결"
    ]
  });
}
