const SOUNDS = [
  {
    char: "詩", jyutping: "si1", copies: ["SEE", "SEA", "C"], audio: "audio/si1.m4a", start: .06,
    responses: [
      { lang: "EN", word: "SEE" }, { lang: "EN", word: "SEA" },
      { lang: "JA", word: "シ" }, { lang: "KO", word: "시" },
      { lang: "FR", word: "SI" }, { lang: "DE", word: "SIE" },
      { lang: "ES", word: "SÍ" }, { lang: "IT", word: "SÌ" },
      { lang: "TH", word: "ซี" }, { lang: "AR", word: "سي" },
      { lang: "RU", word: "СИ" }, { lang: "EL", word: "ΣΙ" },
      { lang: "HE", word: "סי" }, { lang: "HI", word: "सी" }
    ]
  },
  {
    char: "星", jyutping: "sing1", copies: ["SING", "SIN", "THING", "XING"], audio: "audio/sing1.m4a", start: .06,
    responses: [
      { lang: "EN", word: "SING" }, { lang: "EN", word: "SIN" },
      { lang: "JA", word: "シン" }, { lang: "KO", word: "싱" },
      { lang: "FR", word: "SIGNE" }, { lang: "DE", word: "SINN" },
      { lang: "ES", word: "SIN" }, { lang: "EN", word: "THING" },
      { lang: "TH", word: "ซิง" }, { lang: "AR", word: "سينغ" },
      { lang: "RU", word: "СИНГ" }, { lang: "EL", word: "ΣΙΝΓΚ" },
      { lang: "HE", word: "סינג" }, { lang: "HI", word: "सिंग" }
    ]
  },
  {
    char: "買", jyutping: "maai5", copies: ["MY", "MINE", "MAI"], audio: "audio/maai5.m4a", start: .06,
    responses: [
      { lang: "EN", word: "MY" }, { lang: "EN", word: "MINE" },
      { lang: "JA", word: "マイ" }, { lang: "KO", word: "마이" },
      { lang: "FR", word: "MAILLE" }, { lang: "DE", word: "MAI" },
      { lang: "IT", word: "MAI" }, { lang: "EN", word: "MAI" },
      { lang: "TH", word: "ไหม" }, { lang: "AR", word: "ماي" },
      { lang: "RU", word: "МАЙ" }, { lang: "EL", word: "ΜΑΪ" },
      { lang: "HE", word: "מאי" }, { lang: "HI", word: "माई" }
    ]
  },
  {
    char: "心", jyutping: "sam1", copies: ["SUM", "SOME", "SAM"], audio: "audio/sam1.m4a", start: .06,
    responses: [
      { lang: "EN", word: "SUM" }, { lang: "EN", word: "SOME" },
      { lang: "JA", word: "サム" }, { lang: "KO", word: "삼" },
      { lang: "FR", word: "SOMME" }, { lang: "DE", word: "SAM" },
      { lang: "EN", word: "SAM" }, { lang: "ES", word: "SAM" },
      { lang: "TH", word: "ซัม" }, { lang: "AR", word: "سام" },
      { lang: "RU", word: "САМ" }, { lang: "EL", word: "ΣΑΜ" },
      { lang: "HE", word: "סאם" }, { lang: "HI", word: "सम" }
    ]
  },
  {
    char: "飯", jyutping: "faan6", copies: ["FAN", "FUN", "FINE"], audio: "audio/faan6.m4a", start: .06,
    responses: [
      { lang: "EN", word: "FAN" }, { lang: "EN", word: "FUN" },
      { lang: "JA", word: "ファン" }, { lang: "KO", word: "판" },
      { lang: "FR", word: "FAN" }, { lang: "DE", word: "FAHNE" },
      { lang: "ES", word: "FAN" }, { lang: "EN", word: "FINE" },
      { lang: "TH", word: "ฟาน" }, { lang: "AR", word: "فان" },
      { lang: "RU", word: "ФАН" }, { lang: "EL", word: "ΦΑΝ" },
      { lang: "HE", word: "פאן" }, { lang: "HI", word: "फान" }
    ]
  }
];

const LANGUAGE_COLOURS = {
  EN: [23, 76, 156],
  JA: [0, 174, 202],
  KO: [49, 92, 255],
  FR: [101, 88, 232],
  DE: [46, 131, 207],
  ES: [86, 207, 229],
  IT: [41, 163, 190],
  TH: [0, 150, 210],
  AR: [92, 72, 210],
  RU: [20, 112, 176],
  EL: [121, 80, 214],
  HE: [0, 163, 190],
  HI: [55, 96, 224]
};

const canvas = document.querySelector("#projection");
const ctx = canvas.getContext("2d", { alpha: false });
const backgroundLayer = document.createElement("canvas");
const backgroundCtx = backgroundLayer.getContext("2d", { alpha: false });
const nav = document.querySelector("#sound-nav");
const fullscreenButton = document.querySelector("#fullscreen");
const touchDevice = navigator.maxTouchPoints > 0
  || window.matchMedia("(pointer: coarse)").matches
  || /iPad|iPhone|iPod/.test(navigator.userAgent);

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let activeIndex = 1;
let particles = [];
let labels = [];
let shockwaves = [];
let lastTime = 0;
let lastHudUpdate = 0;
let energy = 0;
let eruptionStartedAt = -Infinity;
let eruptionSerial = 0;
let glyphOriginX = 0;
let glyphOriginY = 0;
let glyphRenderSize = 0;
let pointerTimer;
let activeRecording = null;
let activeBufferSource = null;
let playbackId = 0;
let audioContext = null;
let lastRenderedTime = 0;
const SOURCE_INK = "#00143d";
let renderProfile = {
  name: "high",
  dpr: 1,
  particleDivisor: 850,
  minParticles: 850,
  maxParticles: 1250,
  scanlineStep: 4,
  noiseCount: 24,
  textThreshold: .64,
  labelShadow: 0,
  wavePoints: 88,
  maxWaves: 1,
  fps: 60,
  hudInterval: 150
};

const mouse = {
  x: -10000,
  y: -10000,
  lastX: -10000,
  lastY: -10000,
  speed: 0,
  radius: 180,
  active: false
};

const current = () => SOUNDS[activeIndex];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function transformationState(time) {
  if (!Number.isFinite(eruptionStartedAt)) return { wave: 0, copy: 0 };
  const elapsed = time - eruptionStartedAt;
  const waveAttack = clamp(elapsed / 380, 0, 1);
  const copyAttack = clamp(elapsed / 380, 0, 1);
  const release = clamp((elapsed - 720) / 1220, 0, 1);
  const waveEase = 1 - Math.pow(1 - waveAttack, 3);
  const copyEase = 1 - Math.pow(1 - copyAttack, 3);
  const releaseEase = 1 - Math.pow(1 - release, 2.35);
  return {
    wave: waveEase * (1 - releaseEase),
    copy: copyEase * (1 - releaseEase)
  };
}

function getLayout() {
  const compact = width <= 700 || height <= 500;
  const portrait = compact && height > width;
  return {
    compact,
    portrait,
    cx: portrait ? width * .5 : compact ? width * .55 : width * .58,
    cy: portrait ? height * .56 : height * .5,
    glyphSize: portrait
      ? Math.min(width * .86, height * .49)
      : compact
        ? Math.min(width * .58, height * .78)
        : Math.min(width * .62, height * .83)
  };
}

function chooseRenderProfile() {
  const shortSide = Math.min(width, height);
  const area = width * height;
  const cores = navigator.hardwareConcurrency || 6;
  const memory = navigator.deviceMemory || 6;

  if (shortSide < 620 || (touchDevice && shortSide < 760)) {
    return {
      name: "mobile", dpr: 1, particleDivisor: 760,
      minParticles: 520, maxParticles: 780, scanlineStep: 10,
      noiseCount: 6, textThreshold: .76, labelShadow: 0,
      wavePoints: 56, maxWaves: 1, fps: 45, hudInterval: 220
    };
  }
  if (touchDevice) {
    return {
      name: "tablet", dpr: 1, particleDivisor: 820,
      minParticles: 620, maxParticles: 920, scanlineStep: 8,
      noiseCount: 8, textThreshold: .72, labelShadow: 0,
      wavePoints: 64, maxWaves: 1, fps: 50, hudInterval: 180
    };
  }
  if (cores <= 4 || memory <= 4 || area > 2200000) {
    return {
      name: "balanced", dpr: 1, particleDivisor: 900,
      minParticles: 720, maxParticles: 1050, scanlineStep: 7,
      noiseCount: 10, textThreshold: .68, labelShadow: 0,
      wavePoints: 76, maxWaves: 1, fps: 60, hudInterval: 190
    };
  }
  return {
    name: "high", dpr: 1, particleDivisor: 850,
    minParticles: 850, maxParticles: 1250, scanlineStep: 6,
    noiseCount: 12, textThreshold: .64, labelShadow: 0,
    wavePoints: 88, maxWaves: 1, fps: 60, hudInterval: 170
  };
}

const recordings = SOUNDS.map(sound => {
  const recording = new Audio();
  recording.preload = "none";
  recording.src = sound.audio;
  return recording;
});
const audioBuffers = Array(SOUNDS.length).fill(null);
const primedRecordings = new Set();
let audioPreparationStarted = false;

function primeRecording(index) {
  if (primedRecordings.has(index)) return;
  primedRecordings.add(index);
  recordings[index].preload = "auto";
  recordings[index].load();
}

function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

function unlockAudio() {
  const audio = getAudioContext();
  if (audio?.state === "suspended") audio.resume().catch(() => {});
}

function detectVoiceStart(buffer) {
  const frameSize = 256;
  const frameCount = Math.floor(buffer.length / frameSize);
  const levels = new Float32Array(frameCount);

  for (let frame = 0; frame < frameCount; frame++) {
    let sum = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      let channelSum = 0;
      const start = frame * frameSize;
      for (let i = start; i < start + frameSize; i++) channelSum += data[i] * data[i];
      sum += channelSum / frameSize;
    }
    levels[frame] = Math.sqrt(sum / buffer.numberOfChannels);
  }

  const peak = levels.reduce((highest, level) => Math.max(highest, level), 0);
  if (peak < .001) return 0;
  const noiseFrames = Array.from(levels.slice(0, Math.min(frameCount, Math.ceil(buffer.sampleRate * .35 / frameSize))));
  noiseFrames.sort((a, b) => a - b);
  const noiseFloor = noiseFrames[Math.floor(noiseFrames.length * .6)] || 0;
  const threshold = Math.min(peak * .24, Math.max(.0025, noiseFloor * 3.5, peak * .055));

  for (let frame = 0; frame < frameCount - 4; frame++) {
    let sustained = 0;
    for (let lookAhead = 0; lookAhead < 4; lookAhead++) {
      if (levels[frame + lookAhead] >= threshold * .82) sustained++;
    }
    if (levels[frame] >= threshold && sustained >= 3) {
      return Math.max(0, frame * frameSize / buffer.sampleRate - .025);
    }
  }
  return 0;
}

function prepareAudioBuffers() {
  if (audioPreparationStarted) return;
  audioPreparationStarted = true;
  const order = [activeIndex, ...SOUNDS.map((_, index) => index).filter(index => index !== activeIndex)];
  let cursor = 0;

  const scheduleIdle = callback => {
    if ("requestIdleCallback" in window) window.requestIdleCallback(callback, { timeout: 1500 });
    else setTimeout(callback, 520);
  };

  const prepareNext = () => {
    // Audio decoding is CPU-heavy on Safari/Chrome and can collide with the
    // first particle eruption. Never start another decode while the visible
    // spring animation is active.
    if (Number.isFinite(eruptionStartedAt)
        && performance.now() - eruptionStartedAt < 2500) {
      scheduleIdle(prepareNext);
      return;
    }
    if (cursor >= order.length) {
      const detected = audioBuffers.filter(Boolean).length;
      document.querySelector("#audio-source").textContent = detected
        ? `auto-trim : ready ${detected}/5`
        : "recording : cached / trim 0.06s";
      return;
    }
    const index = order[cursor++];
    const sound = SOUNDS[index];
    primeRecording(index);
    document.querySelector("#audio-source").textContent = `loading : ${cursor}/5`;

    const audio = getAudioContext();
    if (!audio) {
      scheduleIdle(prepareNext);
      return;
    }
    fetch(sound.audio)
      .then(response => {
        if (!response.ok) throw new Error(`Audio ${response.status}`);
        return response.arrayBuffer();
      })
      .then(data => audio.decodeAudioData(data))
      .then(buffer => {
        audioBuffers[index] = buffer;
        sound.start = detectVoiceStart(buffer);
      })
      .catch(() => {
        // file:// pages often block fetch; cached HTML audio remains the fallback.
      })
      .finally(() => scheduleIdle(prepareNext));
  };

  scheduleIdle(prepareNext);
}

function buildNavigation() {
  nav.innerHTML = "";
  SOUNDS.forEach((sound, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === activeIndex ? "active" : "";
    button.textContent = `${index + 1}  ${sound.char} / ${sound.jyutping}`;
    button.style.touchAction = "manipulation";
    button.addEventListener("click", () => setSound(index));
    nav.appendChild(button);
  });
}

function setSound(index) {
  activeIndex = index;
  document.querySelector("#exe").textContent = `> ${current().jyutping}.exe`;
  document.querySelector("#source-label").textContent = `${current().char} / ${current().jyutping} / SOURCE`;
  // Start audio before rebuilding thousands of glyph particles.
  playRecording();
  buildNavigation();
  requestAnimationFrame(() => {
    buildGlyph();
    const layout = getLayout();
    burst(layout.cx, layout.cy, 1.15);
  });
}

function resize() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${Math.round(viewportHeight)}px`);
  const rect = canvas.getBoundingClientRect();
  const nextWidth = rect.width;
  const nextHeight = rect.height;
  if (canvas.width && Math.abs(nextWidth - width) < 1 && Math.abs(nextHeight - height) < 1) return;
  width = nextWidth;
  height = nextHeight;
  renderProfile = chooseRenderProfile();
  document.body.dataset.quality = renderProfile.name;
  dpr = Math.min(window.devicePixelRatio || 1, renderProfile.dpr);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildBackgroundLayer();
  mouse.radius = clamp(Math.min(width, height) * .19, 120, 260);
  document.querySelector("#radius").textContent = Math.round(mouse.radius);
  buildGlyph();
}

function buildGlyph() {
  if (!width || !height) return;
  const layout = getLayout();
  const size = Math.floor(layout.glyphSize);
  const offscreen = document.createElement("canvas");
  offscreen.width = size;
  offscreen.height = size;
  const off = offscreen.getContext("2d");
  off.fillStyle = "white";
  off.textAlign = "center";
  off.textBaseline = "middle";
  off.font = `900 ${size * .79}px "PingFang HK", "Noto Sans CJK HK", sans-serif`;
  off.fillText(current().char, size / 2, size / 2 + size * .03);

  glyphRenderSize = size;

  const targetCount = clamp(
    Math.round((width * height) / renderProfile.particleDivisor),
    renderProfile.minParticles,
    renderProfile.maxParticles
  );
  const step = Math.max(4, Math.round(Math.sqrt((size * size) / targetCount)));
  const pixels = off.getImageData(0, 0, size, size).data;
  const originX = layout.cx - size / 2;
  const originY = layout.cy - size / 2;
  glyphOriginX = originX;
  glyphOriginY = originY;
  const prior = particles;
  const next = [];
  const responsePool = current().responses || current().copies.map(word => ({ lang: "EN", word }));
  const systemSymbols = Array.from("0123456789#/.");

  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      if (pixels[(y * size + x) * 4 + 3] > 80) {
        const old = prior[next.length];
        const response = responsePool[next.length % responsePool.length];
        const responseCharacters = Array.from(response.word);
        const sourceX = originX + x;
        const sourceY = originY + y;
        const sourceAngle = Math.atan2(sourceY - layout.cy, sourceX - layout.cx);
        const burstAngle = Number.isFinite(sourceAngle)
          ? sourceAngle + (Math.random() - .5) * 1.18
          : Math.random() * Math.PI * 2;
        const burstCos = Math.cos(burstAngle);
        const burstSin = Math.sin(burstAngle);
        const margin = Math.max(18, Math.min(width, height) * .025);
        const edgeX = Math.abs(burstCos) < .001
          ? Infinity
          : (burstCos > 0 ? width - margin - layout.cx : layout.cx - margin) / Math.abs(burstCos);
        const edgeY = Math.abs(burstSin) < .001
          ? Infinity
          : (burstSin > 0 ? height - margin - layout.cy : layout.cy - margin) / Math.abs(burstSin);
        const edgeDistance = Math.max(40, Math.min(edgeX, edgeY));
        // Keep the destination inside the viewport. The apparent extra distance
        // comes from perspective at draw time, rather than unstable velocity.
        const targetRadius = edgeDistance * (layout.compact
          ? .48 + Math.random() * .3
          : .64 + Math.random() * .27);
        next.push({
          ox: originX + x,
          oy: originY + y,
          // The first frame starts as a complete glyph. Randomising these
          // coordinates made the page visibly assemble itself on load.
          x: old?.x ?? sourceX,
          y: old?.y ?? sourceY,
          vx: old?.vx ?? 0,
          vy: old?.vy ?? 0,
          // Cycle through languages before selecting a character so long Latin
          // words do not statistically overpower shorter non-Latin scripts.
          char: Math.random() < .17
            ? systemSymbols[Math.floor(Math.random() * systemSymbols.length)]
            : responseCharacters[Math.floor(Math.random() * responseCharacters.length)],
          copyWord: response.word,
          copyLang: response.lang,
          copyThreshold: Math.random() * .78,
          wordSeed: Math.random(),
          // A dark structural core stays close to the source glyph so the
          // Cantonese character remains readable through the eruption.
          sourceAnchor: Math.random() < .38,
          burstDelay: Math.random() * 55,
          burstSerial: old?.burstSerial ?? eruptionSerial,
          burstX: layout.cx + burstCos * targetRadius,
          burstY: layout.cy + burstSin * targetRadius,
          depth: .42 + Math.random() * 1.08,
          scatter: 0,
          flow: old?.flow ?? 0,
          seed: Math.random(),
          size: renderProfile.name === "mobile" || renderProfile.name === "tablet"
            ? 6
            : 5 + Math.random() * 3.5
        });
      }
    }
  }
  particles = next;
  document.querySelector("#particle-count").textContent = particles.length.toLocaleString();
  buildLabels();
}

function buildLabels() {
  const layout = getLayout();
  const cx = layout.cx + (layout.compact && !layout.portrait ? width * .01 : width * .01);
  const cy = layout.cy;
  const responses = current().responses || current().copies.map(word => ({ lang: "EN", word }));
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const previous = labels;
  const fieldSize = Math.min(width, height);
  const scriptForwardLanguages = new Set(["JA", "KO", "TH", "AR", "RU", "EL", "HE", "HI"]);
  labels = responses.map((response, i) => {
    const angle = -1.3 + i * goldenAngle;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const margin = Math.max(30, Math.min(width, height) * .055);
    const edgeX = Math.abs(directionX) < .001
      ? Infinity
      : (directionX > 0 ? width - margin - cx : cx - margin) / Math.abs(directionX);
    const edgeY = Math.abs(directionY) < .001
      ? Infinity
      : (directionY > 0 ? height - margin - cy : cy - margin) / Math.abs(directionY);
    const edgeDistance = Math.max(fieldSize * .3, Math.min(edgeX, edgeY));
    const radius = edgeDistance * (layout.compact
      ? .48 + (i % 4) * .075
      : .7 + (i % 4) * .075);
    const x = cx + directionX * radius;
    const y = cy + directionY * radius;
    const homeRadius = layout.glyphSize * (.025 + (i % 3) * .009);
    const homeX = layout.cx + Math.cos(angle) * homeRadius;
    const homeY = layout.cy + Math.sin(angle) * homeRadius * .72;
    const old = previous.find(label => label.lang === response.lang && label.word === response.word)
      || previous[i];
    return {
      ...response,
      x: old?.x ?? homeX,
      y: old?.y ?? homeY,
      homeX,
      homeY,
      baseX: x,
      baseY: y,
      vx: old?.vx ?? (Math.random() - .5) * .18,
      vy: old?.vy ?? (Math.random() - .5) * .18,
      alpha: response.lang === "EN" ? .34 : .25,
      scale: response.lang === "EN"
        ? .8
        : scriptForwardLanguages.has(response.lang)
          ? .96 + (i % 3) * .045
          : .82 + (i % 2) * .04,
      depth: .68 + (i % 4) * .1,
      orbitX: fieldSize * (.026 + (i % 4) * .008),
      orbitY: fieldSize * (.018 + ((i + 2) % 3) * .009),
      speedX: .00017 + (i % 3) * .000035,
      speedY: .00014 + ((i + 1) % 4) * .000026,
      phase: i * .83,
      phase2: i * 1.37 + .7,
      rotation: old?.rotation ?? (Math.random() - .5) * .025,
      rotationVelocity: old?.rotationVelocity ?? 0,
      springScale: old?.springScale ?? 0,
      scaleVelocity: old?.scaleVelocity ?? 0,
      burstDelay: i * 18,
      burstSerial: old?.burstSerial ?? eruptionSerial
    };
  });
}

function pointerMove(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (mouse.active) {
    const dx = x - mouse.x;
    const dy = y - mouse.y;
    mouse.speed = clamp(Math.hypot(dx, dy), 0, 80);
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
  } else {
    mouse.lastX = x;
    mouse.lastY = y;
  }
  mouse.x = x;
  mouse.y = y;
  mouse.active = true;
  energy = clamp(energy + mouse.speed * .005, 0, 1);
  clearTimeout(pointerTimer);
  pointerTimer = setTimeout(() => { mouse.speed *= .15; }, 80);
}

function pointerLeave() {
  mouse.active = false;
  mouse.x = -10000;
  mouse.y = -10000;
}

function burst(x, y, strength = 1) {
  eruptionStartedAt = performance.now();
  eruptionSerial += 1;
  while (shockwaves.length >= renderProfile.maxWaves) shockwaves.shift();
  shockwaves.push({
    x,
    y,
    radius: 4,
    life: 1,
    strength,
    phase: Math.random() * Math.PI * 2
  });
  particles.forEach(p => {
    const dx = p.ox - x;
    const dy = p.oy - y;
    const distance = Math.hypot(dx, dy) || 1;
    // Recalculate the destination for every click. The clicked coordinate is
    // now the true pressure centre instead of the centre of the Chinese glyph.
    // A tiny seeded fan keeps particles near the click from forming a line.
    const clickAngle = Math.atan2(dy, dx) + (p.seed - .5) * .42;
    const directionX = Math.cos(clickAngle);
    const directionY = Math.sin(clickAngle);
    const margin = Math.max(18, Math.min(width, height) * .025);
    const edgeX = Math.abs(directionX) < .001
      ? Infinity
      : (directionX > 0 ? width - margin - p.ox : p.ox - margin) / Math.abs(directionX);
    const edgeY = Math.abs(directionY) < .001
      ? Infinity
      : (directionY > 0 ? height - margin - p.oy : p.oy - margin) / Math.abs(directionY);
    const edgeDistance = Math.max(36, Math.min(edgeX, edgeY));
    const proximity = clamp(1 - distance / (Math.min(width, height) * .92), .34, 1);
    const travel = edgeDistance * (.55 + p.depth * .17) * proximity * strength;
    p.burstX = p.ox + directionX * travel;
    p.burstY = p.oy + directionY * travel;

    const range = Math.min(width, height) * .43;
    if (distance < range) {
      // A very small physical kick gives the click an immediate response. The
      // main eruption follows the controlled spring target in updateParticle.
      const force = (1 - distance / range) * 1.15 * strength;
      p.vx += dx / distance * force;
      p.vy += dy / distance * force;
    }
  });
  labels.forEach(label => {
    label.burstOriginX = x;
    label.burstOriginY = y;
  });
  energy = 1;
}

function updateParticle(p, dt, time) {
  const scale = dt / 16.67;
  p.flow *= Math.pow(.94, scale);
  const burstElapsed = Number.isFinite(eruptionStartedAt)
    ? time - eruptionStartedAt
    : -1;
  const explodeAt = p.burstDelay;
  const scatterAttack = clamp((burstElapsed - explodeAt) / 420, 0, 1);
  const scatterReturn = clamp((burstElapsed - 610 - p.burstDelay * .08) / 1080, 0, 1);
  const scatterAttackEase = 1
    - Math.exp(-4.15 * scatterAttack) * Math.cos(scatterAttack * Math.PI * 3.3);
  const scatterReturnEase = 1 - Math.pow(1 - scatterReturn, 2.45);
  const depthSurge = Math.sin(Math.max(0, burstElapsed - explodeAt) * .0105 + p.depth * 2.4)
    * .045 * (1 - scatterReturnEase);
  const scatter = clamp((scatterAttackEase + depthSurge) * (1 - scatterReturnEase), 0, 1.1);
  p.scatter = scatter;
  if (eruptionSerial > 0 && p.burstSerial !== eruptionSerial
      && burstElapsed >= explodeAt && burstElapsed < 1500) {
    const dx = p.ox - (glyphOriginX + glyphRenderSize / 2);
    const dy = p.oy - (glyphOriginY + glyphRenderSize / 2);
    const distance = Math.hypot(dx, dy) || 1;
    const force = .45 + p.seed * .7;
    p.vx += dx / distance * force;
    p.vy += dy / distance * force;
    p.burstSerial = eruptionSerial;
  }
  if (mouse.active) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < mouse.radius) {
      const proximity = 1 - distance / mouse.radius;
      p.flow = Math.max(p.flow, proximity * (.72 + Math.min(mouse.speed / 45, .65)));
      const force = proximity * proximity * (2.9 + mouse.speed * .2);
      p.vx += dx / distance * force * scale;
      p.vy += dy / distance * force * scale;
      const cursorX = mouse.x - mouse.lastX;
      const cursorY = mouse.y - mouse.lastY;
      p.vx += cursorX * -.052 * proximity;
      p.vy += cursorY * -.052 * proximity;
      const swirlDirection = p.seed > .5 ? 1 : -1;
      const swirl = mouse.speed * .018 * proximity * swirlDirection;
      p.vx += -dy / distance * swirl;
      p.vy += dx / distance * swirl;
    }
  }

  const sourceHold = p.sourceAnchor ? .08 : 1;
  const targetX = p.ox + (p.burstX - p.ox) * scatter * sourceHold;
  const targetY = p.oy + (p.burstY - p.oy) * scatter * sourceHold;
  // A compact, critically damped spring follows the animated destination.
  // This creates a visible overshoot without allowing particles to leave the
  // screen or pause while a large ballistic force settles.
  const baseTether = .031 + (1 - Math.min(scatter, 1)) * .014;
  const returnTether = Math.max(.0045, baseTether * (1 - p.flow * .84));
  p.vx += (targetX - p.x) * returnTether * scale;
  p.vy += (targetY - p.y) * returnTether * scale;
  const drag = Math.pow(.82 + Math.min(p.flow, 1) * .1, scale);
  p.vx *= drag;
  p.vy *= drag;
  p.x += p.vx * scale;
  p.y += p.vy * scale;
}

function buildBackgroundLayer() {
  backgroundLayer.width = canvas.width;
  backgroundLayer.height = canvas.height;
  backgroundCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const layout = getLayout();
  const waterField = backgroundCtx.createRadialGradient(
    layout.cx, layout.cy - height * .02, 0,
    layout.cx, layout.cy - height * .02, Math.max(width, height) * .8
  );
  waterField.addColorStop(0, "#ffffff");
  waterField.addColorStop(.58, "#f9fcff");
  waterField.addColorStop(1, "#edf5fb");
  backgroundCtx.fillStyle = waterField;
  backgroundCtx.fillRect(0, 0, width, height);

  backgroundCtx.strokeStyle = "rgba(23,76,156,.032)";
  backgroundCtx.lineWidth = 1;
  const scanlineStep = renderProfile.scanlineStep;
  for (let y = 0; y < height; y += scanlineStep) {
    backgroundCtx.beginPath();
    backgroundCtx.moveTo(0, y);
    backgroundCtx.lineTo(width, y + Math.sin(y * .19) * .18);
    backgroundCtx.stroke();
  }

  const noiseCount = renderProfile.noiseCount;
  for (let i = 0; i < noiseCount; i++) {
    const x = (i * 193.71 + 37) % width;
    const y = (i * 83.11) % height;
    backgroundCtx.fillStyle = i % 7 === 0 ? "rgba(49,92,255,.20)" : "rgba(23,76,156,.07)";
    backgroundCtx.fillRect(x, y, i % 5 === 0 ? 8 : 2, 1);
  }
}

function drawBackground() {
  ctx.drawImage(backgroundLayer, 0, 0, width, height);
}

function drawParticles(dt, time) {
  const state = transformationState(time);
  // Full words are considerably more expensive than small glyphs on a large
  // canvas. The larger floating labels already carry the multilingual content,
  // so only a light selection of particles needs to become whole words.
  const wordCutoff = renderProfile.name === "mobile" || renderProfile.name === "tablet" ? .965 : .94;
  const eruptionSettled = !Number.isFinite(eruptionStartedAt) || time - eruptionStartedAt > 2350;
  const resting = eruptionSettled && energy < .012 && !mouse.active && shockwaves.length === 0;
  const centreX = glyphOriginX + glyphRenderSize / 2;
  const centreY = glyphOriginY + glyphRenderSize / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const p of particles) {
    if (!resting) updateParticle(p, dt, time);
    const displacement = resting ? 0 : Math.hypot(p.x - p.ox, p.y - p.oy);
    const visualScatter = p.scatter * (p.sourceAnchor ? .1 : 1);
    const perspective = 1 + visualScatter * (.025 + p.depth * .045);
    const renderX = centreX + (p.x - centreX) * perspective;
    const renderY = centreY + (p.y - centreY) * perspective;
    const renderScale = 1 + visualScatter * (.22 + p.depth * .42) + p.flow * .34;
    if (p.sourceAnchor) ctx.fillStyle = SOURCE_INK;
    else if (p.flow > .2 && p.seed > .5) ctx.fillStyle = "#56dff0";
    else if (p.flow > .12) ctx.fillStyle = "#315cff";
    else if (displacement > 82 && p.seed > .52) ctx.fillStyle = "#56cfe5";
    else if (displacement > 48 && p.seed > .43) ctx.fillStyle = "#315cff";
    else if (displacement > 20 && p.seed > .55) ctx.fillStyle = "#2e83cf";
    else ctx.fillStyle = SOURCE_INK;
    // Keep the Cantonese source visibly darker than the water field, including
    // during the multilingual transformation. It recedes, but never washes out.
    const sourceAlpha = (p.sourceAnchor ? .98 : 1)
      * clamp(.84 + p.seed * .16 + p.flow * .12 - displacement * .00055, .64, 1)
      * (1 - state.copy * .24);
    if (p.flow > .06 && p.seed > .36) {
      const trailLength = 1.8 + p.flow * 3.4;
      ctx.globalAlpha = clamp(sourceAlpha * p.flow * .32, 0, .3);
      ctx.fillStyle = p.seed > .62 ? "#56dff0" : "#6558e8";
      const grain = (1 + p.seed * 1.8) * renderScale;
      ctx.fillRect(renderX - p.vx * trailLength, renderY - p.vy * trailLength, grain, grain);
    }
    const becomesCopy = !p.sourceAnchor && p.wordSeed > wordCutoff && state.copy > p.copyThreshold;
    if (becomesCopy) {
      const colour = LANGUAGE_COLOURS[p.copyLang] || LANGUAGE_COLOURS.EN;
      const wordAlpha = clamp((state.copy - p.copyThreshold) * 2.8, 0, 1)
        * clamp(1 - displacement * .0007, .35, 1);
      ctx.font = `700 ${Math.max(5, p.size * .86 * renderScale)}px SFMono-Regular, "Noto Sans Thai", Thonburi, "Noto Naskh Arabic", "Geeza Pro", "Noto Sans Hebrew", "Arial Hebrew", "Noto Sans Devanagari", "Kohinoor Devanagari", "Hiragino Sans", "Apple SD Gothic Neo", Menlo, sans-serif`;
      ctx.direction = p.copyLang === "AR" || p.copyLang === "HE" ? "rtl" : "ltr";
      const trailX = renderX - p.vx * (.28 + p.depth * .18);
      const trailY = renderY - p.vy * (.28 + p.depth * .18);
      ctx.globalAlpha = wordAlpha * .28;
      ctx.fillStyle = "#56dfef";
      ctx.fillText(p.copyWord, trailX - 1.15 * state.copy, trailY);
      ctx.globalAlpha = wordAlpha;
      ctx.fillStyle = `rgb(${colour.join(",")})`;
      const particleGlow = renderProfile.name === "high" && p.seed > .9;
      if (particleGlow) {
        ctx.shadowColor = `rgba(${colour.join(",")},${.1 + p.scatter * .16})`;
        ctx.shadowBlur = p.scatter * (1.5 + p.depth * 3);
      }
      ctx.fillText(p.copyWord, renderX, renderY);
      if (particleGlow) ctx.shadowBlur = 0;
      ctx.direction = "ltr";
    } else if (p.seed > renderProfile.textThreshold) {
      ctx.globalAlpha = sourceAlpha;
      ctx.font = `${p.size * renderScale}px SFMono-Regular, "Noto Sans Thai", Thonburi, "Noto Naskh Arabic", "Geeza Pro", "Noto Sans Hebrew", "Arial Hebrew", "Noto Sans Devanagari", "Kohinoor Devanagari", "Hiragino Sans", "Apple SD Gothic Neo", Menlo, sans-serif`;
      ctx.fillText(p.char, renderX, renderY);
    } else {
      ctx.globalAlpha = sourceAlpha;
      const dot = (1.4 + p.seed * 3.2) * renderScale;
      ctx.fillRect(renderX, renderY, dot, dot);
    }
  }
  ctx.globalAlpha = 1;
}

function drawCopies(time, dt) {
  const eruptionIdle = !Number.isFinite(eruptionStartedAt)
    || (time - eruptionStartedAt > 2350 && energy < .012 && !mouse.active);
  if (eruptionIdle) return;
  const frameScale = dt / 16.67;
  labels.forEach(label => {
    // Before the first click there is no eruption clock. Use a negative idle
    // value instead of Infinity so the canvas keeps rendering the source glyph.
    const elapsed = Number.isFinite(eruptionStartedAt)
      ? time - eruptionStartedAt - label.burstDelay
      : -1;
    // Do not run layout, spring and font work for a label before its reveal.
    // The 18 ms offsets are visually simultaneous but split the expensive
    // first click across several animation frames.
    if (elapsed <= 0) return;
    const attack = clamp(elapsed / 390, 0, 1);
    const returnProgress = clamp((elapsed - 640) / 1080, 0, 1);
    const attackEase = 1 - Math.exp(-4.2 * attack) * Math.cos(attack * Math.PI * 3.25);
    const returnEase = 1 - Math.pow(1 - returnProgress, 2.35);
    const springExtension = 1 + Math.sin(Math.max(0, elapsed) * .012 + label.phase) * .06 * (1 - returnEase);
    const spread = clamp(attackEase * (1 - returnEase), 0, 1.1);
    const reveal = clamp(attackEase * Math.pow(1 - returnEase, .72), 0, 1);
    const burstOriginX = label.burstOriginX ?? label.homeX;
    const burstOriginY = label.burstOriginY ?? label.homeY;
    const returningOriginX = burstOriginX + (label.homeX - burstOriginX) * returnEase;
    const returningOriginY = burstOriginY + (label.homeY - burstOriginY) * returnEase;
    const currentX = returningOriginX + (label.baseX - returningOriginX) * spread * springExtension;
    const currentY = returningOriginY + (label.baseY - returningOriginY) * spread * springExtension;
    const targetX = currentX
      + Math.sin(time * label.speedX + label.phase) * label.orbitX * spread
      + Math.sin(time * .000071 + label.phase2) * label.orbitX * .38 * spread;
    const targetY = currentY
      + Math.cos(time * label.speedY + label.phase2) * label.orbitY * spread
      + Math.sin(time * .00011 + label.phase) * label.orbitY * .44 * spread;

    // Each language leaves the character a fraction later, producing a
    // progressive multilingual eruption instead of one rigid explosion.
    if (eruptionSerial > 0 && elapsed >= 0 && elapsed < 4200 && label.burstSerial !== eruptionSerial) {
      label.x = burstOriginX;
      label.y = burstOriginY;
      const outwardX = label.baseX - burstOriginX;
      const outwardY = label.baseY - burstOriginY;
      const outwardLength = Math.hypot(outwardX, outwardY) || 1;
      const kick = .62 + label.depth * .52;
      label.vx += outwardX / outwardLength * kick;
      label.vy += outwardY / outwardLength * kick;
      label.rotationVelocity += (Math.random() - .5) * .016;
      label.scaleVelocity += .5;
      label.burstSerial = eruptionSerial;
    }

    // The current grows with the reveal and disappears as words return home.
    label.vx += Math.sin(label.y * .0105 + time * .00052 + label.phase) * .021 * label.depth * spread * frameScale;
    label.vy += Math.cos(label.x * .009 - time * .00043 + label.phase2) * .016 * label.depth * spread * frameScale;

    const dx = label.x - mouse.x;
    const dy = label.y - mouse.y;
    const d = Math.hypot(dx, dy) || 1;
    const influenceRadius = mouse.radius * 1.65;
    let desiredScale = spread * (.2 + label.depth * .25)
      + Math.max(0, Math.sin(Math.max(0, elapsed) * .014 + label.phase2)) * .12 * reveal;
    if (spread > .03 && mouse.active && d < influenceRadius) {
      const proximity = 1 - d / influenceRadius;
      const force = proximity * proximity * (.34 + mouse.speed * .038);
      desiredScale += proximity * (.72 + Math.min(mouse.speed / 85, .34));
      label.vx += dx / d * force * frameScale;
      label.vy += dy / d * force * frameScale;
      label.vx += (mouse.x - mouse.lastX) * .022 * proximity;
      label.vy += (mouse.y - mouse.lastY) * .022 * proximity;
      label.rotationVelocity += (mouse.x - mouse.lastX) * .000035 * proximity;
    }

    // Local spring magnification: nearby words swell, then overshoot and settle.
    label.scaleVelocity += (desiredScale - label.springScale) * .13 * frameScale;
    label.scaleVelocity *= Math.pow(.72, frameScale);
    label.springScale += label.scaleVelocity * frameScale;
    label.springScale = clamp(label.springScale, -.08, 1.18);

    // A stronger return tether lets every word dissolve back into the source.
    const tether = .03 + (1 - Math.min(spread, 1)) * .016;
    label.vx += (targetX - label.x) * tether * frameScale;
    label.vy += (targetY - label.y) * tether * frameScale;
    const drag = Math.pow(.85, frameScale);
    label.vx *= drag;
    label.vy *= drag;
    label.rotationVelocity *= Math.pow(.94, frameScale);
    label.x += label.vx * frameScale;
    label.y += label.vy * frameScale;
    label.rotation += (label.rotationVelocity + label.vx * .00045) * frameScale;
    label.rotation *= Math.pow(.998, frameScale);

    const floatScale = 1 + Math.sin(time * .00063 + label.phase2) * .035 * label.depth;
    const depthScale = 1 + spread * (.18 + label.depth * .3);
    const interactionScale = (1 + label.springScale * .72) * depthScale;
    ctx.save();
    ctx.translate(label.x, label.y);
    ctx.rotate(clamp(label.rotation, -.09, .09));
    ctx.scale(floatScale * interactionScale, floatScale * interactionScale);
    const size = Math.round((18 + energy * 12) * label.scale * (.92 + label.depth * .1));
    const colour = LANGUAGE_COLOURS[label.lang] || LANGUAGE_COLOURS.EN;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = label.lang === "AR" || label.lang === "HE" ? "rtl" : "ltr";
    ctx.font = `700 ${size}px SFMono-Regular, "Noto Sans Thai", Thonburi, "Noto Naskh Arabic", "Geeza Pro", "Noto Sans Hebrew", "Arial Hebrew", "Noto Sans Devanagari", "Kohinoor Devanagari", "Hiragino Sans", "Apple SD Gothic Neo", "PingFang HK", Menlo, sans-serif`;
    // Chromatic copies extend back towards the source, creating a light
    // typographic extrusion instead of a flat scale-up.
    const radialX = label.x - label.homeX;
    const radialY = label.y - label.homeY;
    const radialLength = Math.hypot(radialX, radialY) || 1;
    const extrusion = spread * (4 + label.depth * 7);
    const extrudeX = -radialX / radialLength * extrusion;
    const extrudeY = -radialY / radialLength * extrusion;
    ctx.fillStyle = `rgba(86,223,239,${clamp((.045 + energy * .055) * reveal, 0, .13)})`;
    ctx.fillText(label.word, extrudeX * 1.7 - label.vx * 1.2, extrudeY * 1.7 - label.vy * 1.2);
    ctx.fillStyle = `rgba(101,88,232,${clamp((.04 + energy * .05) * reveal, 0, .12)})`;
    ctx.fillText(label.word, extrudeX * .82, extrudeY * .82);
    ctx.fillStyle = `rgba(${colour.join(",")},${clamp((label.alpha + energy * .38) * reveal, 0, .9)})`;
    ctx.fillText(label.word, 0, 0);
    ctx.font = `700 ${Math.max(7, Math.round(size * .34))}px SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = `rgba(${colour.join(",")},${clamp((label.alpha + energy * .25) * reveal, 0, .72)})`;
    ctx.fillText(label.lang, 0, size * .86);
    ctx.restore();
  });
}

function drawShockwaves(dt, time) {
  ctx.save();
  for (const wave of shockwaves) {
    wave.radius += dt * .36 * wave.strength;
    wave.life -= dt * .00072;

    const progress = 1 - wave.life;
    const attack = Math.min(1, progress * 8);
    const amplitude = (7 + wave.radius * .035) * wave.strength * attack * Math.pow(Math.max(0, wave.life), .42);
    const colourMix = .5 + Math.sin(progress * Math.PI) * .5;
    const red = Math.round(35 + colourMix * 48);
    const green = Math.round(116 + colourMix * 18);
    const blue = Math.round(225 + colourMix * 24);
    ctx.strokeStyle = `rgba(${red},${green},${blue},${Math.max(0, wave.life) * .82})`;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    const points = renderProfile.wavePoints;
    for (let i = 0; i <= points; i++) {
      const angle = i / points * Math.PI * 2;
      const travellingPhase = wave.radius * .075 - time * .0026;
      const fineWave = Math.sin(angle * 38 + travellingPhase + wave.phase) * amplitude * .46;
      const midWave = Math.sin(angle * 17 - travellingPhase * .62 + wave.phase * 1.7) * amplitude * .34;
      const lowWave = Math.sin(angle * 7 + travellingPhase * .24 - wave.phase) * amplitude * .2;
      const asymmetricPulse = Math.pow(Math.abs(Math.sin(angle * 2.5 + wave.phase)), 3) * amplitude * .28;
      const radius = Math.max(1, wave.radius + fineWave + midWave + lowWave + asymmetricPulse);
      const px = wave.x + Math.cos(angle) * radius;
      const py = wave.y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  shockwaves = shockwaves.filter(wave => wave.life > 0);
  ctx.restore();
}

function updateHud() {
  const amplitude = clamp(energy * .86 + mouse.speed / 140, 0, 1);
  document.querySelector("#amplitude").textContent = amplitude.toFixed(2);
  document.querySelector("#velocity").textContent = mouse.speed.toFixed(2);
  document.querySelector("#meter-fill").style.width = `${amplitude * 100}%`;
  const responses = current().responses || current().copies.map(word => ({ lang: "EN", word }));
  document.querySelector("#stream").textContent = Array.from({ length: 8 }, (_, i) => {
    const response = responses[(i + Math.floor(performance.now() / 600)) % responses.length];
    const heard = `${response.lang}:${response.word}`;
    return `${i % 3 === 0 ? ">" : " "} ${heard.padEnd(11, " ")} ${String(Math.round(amplitude * (97 - i * 3))).padStart(2, "0")}`;
  }).join("\n");
}

function playTone() {
  const audio = getAudioContext();
  if (!audio) return;
  audio.resume();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();
  const frequencies = [330, 392, 262, 294, 220];
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequencies[activeIndex], audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(frequencies[activeIndex] * 1.16, audio.currentTime + .2);
  filter.type = "bandpass";
  filter.frequency.value = 820;
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.11, audio.currentTime + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .65);
  oscillator.connect(filter).connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + .7);
}

function playCachedRecording(requestId) {
  const recording = recordings[activeIndex];
  activeRecording = recording;
  document.querySelector("#audio-source").textContent = `cached : ${current().jyutping}`;
  try { recording.currentTime = current().start; } catch (_) {}
  recording.addEventListener("ended", () => {
    if (activeRecording === recording) activeRecording = null;
  }, { once: true });
  const playback = recording.play();
  if (playback) playback.catch(() => {
    if (requestId !== playbackId) return;
    if (activeRecording === recording) activeRecording = null;
    document.querySelector("#audio-source").textContent = "recording : fallback";
    playTone();
  });
}

function playRecording() {
  const requestId = ++playbackId;
  primeRecording(activeIndex);
  if (activeRecording) {
    activeRecording.pause();
    activeRecording = null;
  }
  if (activeBufferSource) {
    try { activeBufferSource.stop(); } catch (_) {}
    activeBufferSource = null;
  }

  const audio = getAudioContext();
  const buffer = audioBuffers[activeIndex];
  if (audio && buffer) {
    const startDecodedAudio = () => {
      if (requestId !== playbackId) return;
      const source = audio.createBufferSource();
      source.buffer = buffer;
      source.connect(audio.destination);
      activeBufferSource = source;
      source.addEventListener("ended", () => {
        if (activeBufferSource === source) activeBufferSource = null;
      }, { once: true });
      document.querySelector("#audio-source").textContent = `auto : ${current().jyutping} @ ${current().start.toFixed(2)}s`;
      source.start(0, Math.min(current().start, Math.max(0, buffer.duration - .01)));
    };
    if (audio.state === "running") startDecodedAudio();
    else audio.resume().then(startDecodedAudio).catch(() => {
      if (requestId === playbackId) playCachedRecording(requestId);
    });
  } else {
    playCachedRecording(requestId);
  }
  energy = 1;
}

function animate(time) {
  const idle = energy < .012 && shockwaves.length === 0 && mouse.speed < .1;
  const targetFps = idle ? Math.min(24, renderProfile.fps) : renderProfile.fps;
  if (time - lastRenderedTime < 1000 / targetFps) {
    requestAnimationFrame(animate);
    return;
  }
  lastRenderedTime = time;
  const dt = clamp(time - lastTime || 16.67, 1, 34);
  lastTime = time;
  energy *= Math.pow(.974, dt / 16.67);
  mouse.speed *= Math.pow(.84, dt / 16.67);
  drawBackground(time);
  drawCopies(time, dt);
  drawParticles(dt, time);
  drawShockwaves(dt, time);
  if (time - lastHudUpdate > renderProfile.hudInterval) {
    updateHud();
    lastHudUpdate = time;
  }
  requestAnimationFrame(animate);
}

canvas.addEventListener("pointermove", pointerMove);
canvas.addEventListener("pointerleave", pointerLeave);
document.addEventListener("pointerdown", unlockAudio, { capture: true, passive: true });
canvas.addEventListener("pointerdown", event => {
  document.body.classList.add("has-interacted");
  pointerMove(event);
  burst(mouse.x, mouse.y, 1.1);
  // Let the browser paint the first outward frame before starting audio work.
  // The recording follows one frame later (about 16 ms), which remains
  // perceptually simultaneous while removing the click hitch.
  requestAnimationFrame(playRecording);
});

window.addEventListener("keydown", event => {
  if (/^[1-5]$/.test(event.key)) setSound(Number(event.key) - 1);
  if (event.key.toLowerCase() === "h") document.body.classList.toggle("ui-hidden");
  if (event.key.toLowerCase() === "f") toggleFullscreen();
  if (event.key === " ") {
    event.preventDefault();
    const layout = getLayout();
    burst(layout.cx, layout.cy, 1.25);
    playRecording();
  }
  if (event.key.toLowerCase() === "r") buildGlyph();
});

async function toggleFullscreen() {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
}

fullscreenButton.addEventListener("click", toggleFullscreen);
let resizeFrame = 0;
function requestResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(resize);
}
window.addEventListener("resize", requestResize);
window.visualViewport?.addEventListener("resize", requestResize);
document.addEventListener("fullscreenchange", () => setTimeout(requestResize, 80));

buildNavigation();
requestAnimationFrame(() => {
  resize();
  requestAnimationFrame(animate);
  // Preload only the selected recording after the first paint. Full waveform
  // analysis waits until the opening composition is already stable, so audio
  // decoding cannot interrupt the first visible interaction.
  setTimeout(() => {
    primeRecording(activeIndex);
  }, 120);
  setTimeout(() => {
    prepareAudioBuffers();
  }, 5200);
});
