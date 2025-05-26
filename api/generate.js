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
    characterDetails = {},
    sequenceNumber = 1 
  } = req.body;

  // 캐릭터별 실사화 특징 정의
  const characterTraits = {
    '성진우': {
      ethnicity: 'Korean male, 20s',
      appearance: 'sharp jawline, black hair, intense dark eyes, pale skin',
      outfit: 'modern black tactical suit with purple accents, NOT fantasy armor',
      style: 'K-drama actor appearance, Lee Min-ho type',
      powers: 'dark purple shadow effects, NOT cartoony, subtle dark mist'
    },
    '나루토': {
      ethnicity: 'Japanese teenage boy, 16-17 years',
      appearance: 'natural spiky blonde hair (NOT anime spikes), subtle whisker scars on cheeks',
      outfit: 'modern athletic orange and black outfit inspired by ninja aesthetic',
      style: 'young Japanese actor type, natural Asian features',
      powers: 'subtle blue energy glow, realistic body doubles'
    },
    '루피': {
      ethnicity: 'Brazilian/Latino young man',
      appearance: 'messy black hair, wide genuine smile, athletic lean build',
      outfit: 'red vest over bare chest, blue denim shorts, straw hat',
      style: 'young energetic actor type',
      powers: 'subtle skin stretch effects, practical wire-fu style movements'
    }
  };

  // 입력 분석 및 캐릭터 추출
  const extractedCharacters = Object.keys(characterTraits).filter(char => 
    input.toLowerCase().includes(char.toLowerCase())
  );

  // 실사화 강조 키워드
  const photorealismKeywords = [
    'photographed with ARRI Alexa',
    'natural lighting',
    'real human actors',
    'practical effects NOT CGI',
    'shot on location',
    'no anime features',
    'realistic proportions',
    'subtle VFX only'
  ];

  // 캐릭터별 프롬프트 생성
  const buildCharacterPrompt = (charName) => {
    const traits = characterTraits[charName];
    if (!traits) return charName;
    
    return `${traits.ethnicity}, ${traits.appearance}, wearing ${traits.outfit}, ${traits.style}`;
  };

  // 시퀀스별 액션 정의 (더 현실적으로)
  const sequenceActions = {
    1: 'standing face to face, tense standoff, fists clenched',
    2: 'mid-motion, launching attacks, practical wire stunts',
    3: 'attacks connecting, real impact, stunt choreography',
    4: 'explosive collision, practical effects, debris flying',
    5: 'aftermath, one standing victorious, exhausted'
  };

  // 메인 프롬프트 생성
  let mainPrompt = '';
  
  if (extractedCharacters.length > 0) {
    // 캐릭터가 감지된 경우
    const characterPrompts = extractedCharacters.map(char => buildCharacterPrompt(char));
    
    mainPrompt = `Real photograph of ${characterPrompts.join(' facing ')}, ${sequenceActions[sequenceNumber]}, ${photorealismKeywords.join(', ')}`;
    
    // 특수 능력 추가 (현실적으로)
    if (input.includes('그림자') || input.includes('shadow')) {
      mainPrompt += ', subtle purple lighting effects on ground, practical shadow puppetry';
    }
    if (input.includes('분신') || input.includes('clone')) {
      mainPrompt += ', multiple identical actors in frame, motion blur between positions';
    }
  } else {
    // 일반 입력
    mainPrompt = `Photorealistic ${input}`;
  }

  // 최종 프롬프트
  const finalPrompts = {
    midjourney: `${mainPrompt}, professional movie still, no cartoon elements, human actors only --seed ${sessionId || Math.floor(Math.random() * 1000000)} --v 6.1 --style raw --ar 21:9 --q 2`,
    kling: {
      imageToVideo: `Make the actors perform realistic combat choreography, practical stunts, 10 seconds`,
      textToVideo: `${mainPrompt}, dynamic camera work, professional fight choreography, slow motion impacts`,
      settings: {
        mode: 'professional',
        motion: 0.7,
        creativity: 0.3  // 낮게 설정하여 더 현실적으로
      }
    }
  };

  // 개선 제안사항
  const improvements = {
    tips: [
      "❗ '실사화'는 실제 배우가 연기하는 것처럼 만드는 것입니다",
      "💡 얼굴은 실제 한국/일본 배우 같은 느낌으로 생성됩니다",
      "🎬 특수효과는 Marvel 영화처럼 최소한으로 적용됩니다",
      "📸 의상은 현대적으로 재해석됩니다"
    ],
    alternativePrompts: [
      mainPrompt.replace('facing', 'in Hollywood blockbuster style confrontation'),
      mainPrompt + ', behind the scenes movie set visible',
      mainPrompt + ', stunt doubles with wire rigs'
    ]
  };

  res.status(200).json({
    prompts: finalPrompts,
    characterAnalysis: extractedCharacters.map(char => ({
      name: char,
      traits: characterTraits[char]
    })),
    improvements,
    continuity: {
      sessionId: sessionId || Date.now().toString(),
      nextSequence: sequenceNumber < 5 ? sequenceNumber + 1 : 1,
      consistency: "Use same actor references throughout sequence"
    }
  });
}
