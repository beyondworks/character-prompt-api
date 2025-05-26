export default function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', 'https://chatgpt.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    input, 
    mode = 'standard', 
    sessionId = null,
    previousContext = null,
    sequenceNumber = 1 
  } = req.body;

  // 세션 ID 생성 또는 유지
  const currentSessionId = sessionId || Date.now().toString();
  
  // 캐릭터 일관성을 위한 시드값
  const characterSeed = sessionId ? parseInt(sessionId) % 1000000 : Math.floor(Math.random() * 1000000);

  // 모드별 프롬프트 생성
  const generatePrompts = (mode) => {
    const basePrompt = {
      quick: {
        midjourney: `Photorealistic ${input}, frontal view, neutral background --seed ${characterSeed} --v 6.1 --style raw`,
        kling: `${input} standing still, subtle breathing motion, 5 seconds, static camera`
      },
      standard: {
        midjourney: `Photorealistic ${input}, cinematic composition, detailed textures, professional photography, consistent character design --seed ${characterSeed} --v 6.1 --style raw --ar 16:9`,
        kling: `${input} in dynamic action, smooth motion, professional cinematography, 5-10 seconds, slight camera movement`
      },
      cinematic: {
        midjourney: `Ultra-photorealistic ${input}, Hollywood blockbuster quality, IMAX shot, dramatic lighting, epic scene --seed ${characterSeed} --v 6.1 --style raw --ar 21:9 --q 2`,
        kling: `${input} epic cinematic sequence, complex choreography, sweeping camera movements, 10 seconds, professional mode`
      }
    };

    return basePrompt[mode] || basePrompt.standard;
  };

  const prompts = generatePrompts(mode);

  // 시퀀스별 추가 프롬프트
  const sequencePrompts = {
    1: { // 첫 등장
      kling: `${prompts.kling}, character introduction, establishing shot`,
      transition: "Character revealed, ready for action"
    },
    2: { // 파워 업
      kling: `${prompts.kling}, energy charging up, aura effects, hair and clothing moving`,
      transition: "Power level increasing, preparing attack"
    },
    3: { // 공격
      kling: `${prompts.kling}, launching attack, fast movement, impact frames`,
      transition: "Attack launched, enemy reacting"
    },
    4: { // 충돌
      kling: `${prompts.kling}, attacks colliding, shockwave effects, debris flying`,
      transition: "Energy clash at peak, environment reacting"
    },
    5: { // 결과
      kling: `${prompts.kling}, aftermath scene, dust settling, victory pose`,
      transition: "Battle concluded, new equilibrium"
    }
  };

  // 현재 시퀀스에 맞는 프롬프트 선택
  const currentSequence = sequencePrompts[sequenceNumber] || sequencePrompts[1];

  // 연속성 데이터
  const continuityData = {
    sessionId: currentSessionId,
    characterSeed: characterSeed,
    nextSequence: sequenceNumber < 5 ? sequenceNumber + 1 : 1,
    characterReference: previousContext?.characterUrl || null,
    suggestions: {
      nextScene: currentSequence.transition,
      cameraAngle: getNextCameraAngle(sequenceNumber),
      klingSettings: {
        mode: mode === 'cinematic' ? 'professional' : 'standard',
        creativity: mode === 'cinematic' ? 0.8 : 0.5,
        motion: getMotionIntensity(sequenceNumber)
      }
    }
  };

  // 완전한 응답
  const response = {
    prompts: {
      midjourney: prompts.midjourney,
      kling: currentSequence.kling,
      klingAlternatives: [
        `Text-to-Video: ${prompts.kling}`,
        `Image-to-Video prompt: Make the character ${getActionDescription(sequenceNumber)}`,
        `Professional mode: ${prompts.kling}, 96fps capture, motion blur enabled`
      ]
    },
    continuity: continuityData,
    sequence: {
      current: sequenceNumber,
      total: 5,
      description: getSequenceDescription(sequenceNumber)
    },
    tips: {
      midjourney: `Use --cref URL for character consistency across images`,
      kling: `For best results, use Image-to-Video with the Midjourney output`,
      workflow: `Generate MJ image → Import to Kling → Apply motion prompt`
    }
  };

  res.status(200).json(response);
}

// 헬퍼 함수들
function getNextCameraAngle(seq) {
  const angles = ['wide shot', 'medium shot', 'close-up', 'over-shoulder', 'aerial view'];
  return angles[seq - 1] || angles[0];
}

function getMotionIntensity(seq) {
  const intensity = [0.3, 0.5, 0.9, 1.0, 0.4];
  return intensity[seq - 1] || 0.5;
}

function getActionDescription(seq) {
  const actions = [
    'enter the scene with confidence',
    'power up with growing energy',
    'execute their signature move',
    'clash with opposing force',
    'stand victorious after battle'
  ];
  return actions[seq - 1] || actions[0];
}

function getSequenceDescription(seq) {
  const descriptions = [
    'Character Introduction - Establishing presence',
    'Power Gathering - Building tension',
    'Attack Launch - Action climax',
    'Impact Moment - Peak conflict',
    'Resolution - Battle conclusion'
  ];
  return descriptions[seq - 1] || descriptions[0];
}
