const SOUNDS = [
  {
    char: "詩", jyutping: "si1", copies: ["SEE", "SEA", "C"], audio: "audio/si1.m4a", start: .06,
    responses: [
      { lang: "EN", word: "SEE" }, { lang: "EN", word: "SEA" },
      { lang: "JA", word: "シ" }, { lang: "KO", word: "시" },
      { lang: "FR", word: "SI" }, { lang: "DE", word: "SIE" },
      { lang: "ES", word: "SÍ" }, { lang: "IT", word: "SÌ" }
    ]
  },
  {
    char: "星", jyutping: "sing1", copies: ["SING", "SIN", "THING", "XING"], audio: "audio/sing1.m4a", start: .06,
    responses: [
      { lang: "EN", word: "SING" }, { lang: "EN", word: "SIN" },
      { lang: "JA", word: "シン" }, { lang: "KO", word: "싱" },
      { lang: "FR", word: "SIGNE" }, { lang: "DE", word: "SINN" },
      { lang: "ES", word: "SIN" }, { lang: "EN", word: "THING" }
    ]
  },
  {
    char: "買", jyutping: "maai5", copies: ["MY", "MINE", "MAI"], audio: "audio/maai5.m4a", start: .06,
    responses: [
      { lang: "EN", word: "MY" }, { lang: "EN", word: "MINE" },
      { lang: "JA", word: "マイ" }, { lang: "KO", word: "마이" },
      { lang: "FR", word: "MAILLE" }, { lang: "DE", word: "MAI" },
      { lang: "IT", word: "MAI" }, { lang: "EN", word: "MAI" }
    ]
  },
  {
    char: "心", jyutping: "sam1", copies: ["SUM", "SOME", "SAM"], audio: "audio/sam1.m4a", start: .06,
    responses: [
      { lang: "EN", word: "SUM" }, { lang: "EN", word: "SOME" },
      { lang: "JA", word: "サム" }, { lang: "KO", word: "삼" },
      { lang: "FR", word: "SOMME" }, { lang: "DE", word: "SAM" },
      { lang: "EN", word: "SAM" }, { lang: "ES", word: "SAM" }
    ]
  },
  {
    char: "飯", jyutping: "faan6", copies: ["FAN", "FUN", "FINE"], audio: "audio/faan6.m4a", start: .06,
    responses: [
      { lang: "EN", word: "FAN" }, { lang: "EN", word: "FUN" },
      { lang: "JA", word: "ファン" }, { lang: "KO", word: "판" },
      { lang: "FR", word: "FAN" }, { lang: "DE", word: "FAHNE" },
      { lang: "ES", word: "FAN" }, { lang: "EN", word: "FINE" }
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
  IT: [41, 163, 190]
};

const canvas = document.querySelector("#projection");
const ctx = canvas.getContext("2d", { alpha: false });
const nav = document.querySelector("#sound-nav");
const fullscreenButton = document.querySelector("#fullscreen");

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
let pointerTimer;
let activeRecording = null;
let activeBufferSource = null;
let playbackId = 0;
let audioContext = null;

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

const recordings = SOUNDS.map(sound => {
  const recording = new Audio(sound.audio);
  recording.preload = "auto";
  recording.load();
  return recording;
});
const audioBuffers = Array(SOUNDS.length).fill(null);

function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
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

async function prepareAudioBuffers() {
  const audio = getAudioContext();
  if (!audio) return;
  document.querySelector("#audio-source").textContent = "recording : analysing";
  await Promise.all(SOUNDS.map(async (sound, index) => {
    try {
      const response = await fetch(sound.audio);
      if (!response.ok) throw new Error(`Audio ${response.status}`);
      const buffer = await audio.decodeAudioData(await response.arrayBuffer());
      audioBuffers[index] = buffer;
      sound.start = detectVoiceStart(buffer);
    } catch (_) {
      // file:// pages often block fetch; cached HTML audio remains the fallback.
    }
  }));
  const detected = audioBuffers.filter(Boolean).length;
  document.querySelector("#audio-source").textContent = detected
    ? `auto-trim : ready ${detected}/5`
    : "recording : cached / trim 0.06s";
}

function buildNavigation() {
  nav.innerHTML = "";
  SOUNDS.forEach((sound, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === activeIndex ? "active" : "";
    button.textContent = `${index + 1}  ${sound.char} / ${sound.jyutping}`;
    button.addEventListener("click", () => setSound(index));
    nav.appendChild(button);
  });
}

function setSound(index) {
  activeIndex = index;
  document.querySelector("#exe").textContent = `> ${current().jyutping}.exe`;
  document.querySelector("#source-label").textContent = `${current().char} / ${current().jyutping} / SOURCE`;
  buildNavigation();
  buildGlyph();
  const layout = getLayout();
  burst(layout.cx, layout.cy, 1.15);
  playRecording();
}

function resize() {
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${Math.round(viewportHeight)}px`);
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

  const targetCount = layout.compact
    ? clamp(Math.round((width * height) / 190), 2400, 5200)
    : clamp(Math.round((width * height) / 225), 3200, 8500);
  const step = Math.max(4, Math.round(Math.sqrt((size * size) / targetCount)));
  const pixels = off.getImageData(0, 0, size, size).data;
  const originX = layout.cx - size / 2;
  const originY = layout.cy - size / 2;
  const prior = particles;
  const next = [];
  const alphabet = `${current().copies.join("")}0123456789#/.`;

  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      if (pixels[(y * size + x) * 4 + 3] > 80) {
        const old = prior[next.length];
        next.push({
          ox: originX + x,
          oy: originY + y,
          x: old?.x ?? originX + x + (Math.random() - .5) * 80,
          y: old?.y ?? originY + y + (Math.random() - .5) * 80,
          vx: old?.vx ?? 0,
          vy: old?.vy ?? 0,
          char: alphabet[Math.floor(Math.random() * alphabet.length)],
          seed: Math.random(),
          size: 5 + Math.random() * 3.5
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
  labels = responses.map((response, i) => {
    const angle = -1.3 + i * goldenAngle;
    const radius = fieldSize * (layout.portrait
      ? (.22 + (i % 3) * .04)
      : (.27 + (i % 3) * .055));
    const x = cx + Math.cos(angle) * radius * 1.22;
    const y = cy + Math.sin(angle) * radius * .84;
    const old = previous.find(label => label.lang === response.lang && label.word === response.word)
      || previous[i];
    return {
      ...response,
      x: old?.x ?? x,
      y: old?.y ?? y,
      baseX: x,
      baseY: y,
      vx: old?.vx ?? (Math.random() - .5) * .18,
      vy: old?.vy ?? (Math.random() - .5) * .18,
      alpha: response.lang === "EN" ? .34 : .25,
      scale: response.lang === "EN" ? 1 : .78 + (i % 2) * .08,
      depth: .68 + (i % 4) * .1,
      orbitX: fieldSize * (.026 + (i % 4) * .008),
      orbitY: fieldSize * (.018 + ((i + 2) % 3) * .009),
      speedX: .00017 + (i % 3) * .000035,
      speedY: .00014 + ((i + 1) % 4) * .000026,
      phase: i * .83,
      phase2: i * 1.37 + .7,
      rotation: old?.rotation ?? (Math.random() - .5) * .025,
      rotationVelocity: old?.rotationVelocity ?? 0
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
  shockwaves.push({
    x,
    y,
    radius: 4,
    life: 1,
    strength,
    phase: Math.random() * Math.PI * 2
  });
  particles.forEach(p => {
    const dx = p.x - x;
    const dy = p.y - y;
    const distance = Math.hypot(dx, dy) || 1;
    const range = Math.min(width, height) * .43;
    if (distance < range) {
      const force = (1 - distance / range) * 24 * strength;
      p.vx += dx / distance * force;
      p.vy += dy / distance * force;
    }
  });
  labels.forEach(label => {
    const dx = label.x - x;
    const dy = label.y - y;
    const distance = Math.hypot(dx, dy) || 1;
    const range = Math.min(width, height) * .58;
    if (distance < range) {
      const force = Math.pow(1 - distance / range, 1.35) * 8.5 * strength;
      label.vx += dx / distance * force;
      label.vy += dy / distance * force;
      label.rotationVelocity += ((dx / distance) * .003 + (Math.random() - .5) * .012) * strength;
    }
  });
  energy = 1;
}

function updateParticle(p, dt) {
  const scale = dt / 16.67;
  if (mouse.active) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < mouse.radius) {
      const proximity = 1 - distance / mouse.radius;
      const force = proximity * proximity * (2.6 + mouse.speed * .16);
      p.vx += dx / distance * force * scale;
      p.vy += dy / distance * force * scale;
      p.vx += (mouse.x - mouse.lastX) * -.018 * proximity;
      p.vy += (mouse.y - mouse.lastY) * -.018 * proximity;
    }
  }

  p.vx += (p.ox - p.x) * .017 * scale;
  p.vy += (p.oy - p.y) * .017 * scale;
  const drag = Math.pow(.905, scale);
  p.vx *= drag;
  p.vy *= drag;
  p.x += p.vx * scale;
  p.y += p.vy * scale;
}

function drawBackground(time) {
  const layout = getLayout();
  const waterField = ctx.createRadialGradient(
    layout.cx, layout.cy - height * .02, 0,
    layout.cx, layout.cy - height * .02, Math.max(width, height) * .8
  );
  waterField.addColorStop(0, "#ffffff");
  waterField.addColorStop(.58, "#f9fcff");
  waterField.addColorStop(1, "#edf5fb");
  ctx.fillStyle = waterField;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(23,76,156,.032)";
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + Math.sin(time * .001 + y) * .18);
    ctx.stroke();
  }

  for (let i = 0; i < 40; i++) {
    const x = (i * 193.71 + time * .009) % width;
    const y = (i * 83.11) % height;
    ctx.fillStyle = i % 7 === 0 ? "rgba(49,92,255,.20)" : "rgba(23,76,156,.07)";
    ctx.fillRect(x, y, i % 5 === 0 ? 8 : 2, 1);
  }
}

function drawParticles(dt) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const p of particles) {
    updateParticle(p, dt);
    const displacement = Math.hypot(p.x - p.ox, p.y - p.oy);
    if (displacement > 82 && p.seed > .52) ctx.fillStyle = "#56cfe5";
    else if (displacement > 48 && p.seed > .43) ctx.fillStyle = "#315cff";
    else if (displacement > 20 && p.seed > .55) ctx.fillStyle = "#2e83cf";
    else ctx.fillStyle = "#031b4e";
    ctx.globalAlpha = clamp(.72 + p.seed * .28 - displacement * .001, .34, 1);
    if (p.seed > .34) {
      ctx.font = `${p.size}px SFMono-Regular, Menlo, monospace`;
      ctx.fillText(p.char, p.x, p.y);
    } else {
      const dot = 1.4 + p.seed * 3.2;
      ctx.fillRect(p.x, p.y, dot, dot);
    }
  }
  ctx.globalAlpha = 1;
}

function drawCopies(time, dt) {
  const frameScale = dt / 16.67;
  labels.forEach(label => {
    const targetX = label.baseX
      + Math.sin(time * label.speedX + label.phase) * label.orbitX
      + Math.sin(time * .000071 + label.phase2) * label.orbitX * .38;
    const targetY = label.baseY
      + Math.cos(time * label.speedY + label.phase2) * label.orbitY
      + Math.sin(time * .00011 + label.phase) * label.orbitY * .44;

    // An uneven current keeps every word moving even while the viewer is still.
    label.vx += Math.sin(label.y * .0105 + time * .00052 + label.phase) * .021 * label.depth * frameScale;
    label.vy += Math.cos(label.x * .009 - time * .00043 + label.phase2) * .016 * label.depth * frameScale;

    const dx = label.x - mouse.x;
    const dy = label.y - mouse.y;
    const d = Math.hypot(dx, dy) || 1;
    const influenceRadius = mouse.radius * 1.65;
    if (mouse.active && d < influenceRadius) {
      const proximity = 1 - d / influenceRadius;
      const force = proximity * proximity * (.34 + mouse.speed * .038);
      label.vx += dx / d * force * frameScale;
      label.vy += dy / d * force * frameScale;
      label.vx += (mouse.x - mouse.lastX) * .022 * proximity;
      label.vy += (mouse.y - mouse.lastY) * .022 * proximity;
      label.rotationVelocity += (mouse.x - mouse.lastX) * .000035 * proximity;
    }

    // A soft tether keeps the words in the composition without pinning them.
    label.vx += (targetX - label.x) * .0046 * frameScale;
    label.vy += (targetY - label.y) * .0046 * frameScale;
    const drag = Math.pow(.968, frameScale);
    label.vx *= drag;
    label.vy *= drag;
    label.rotationVelocity *= Math.pow(.94, frameScale);
    label.x += label.vx * frameScale;
    label.y += label.vy * frameScale;
    label.rotation += (label.rotationVelocity + label.vx * .00045) * frameScale;
    label.rotation *= Math.pow(.998, frameScale);

    const floatScale = 1 + Math.sin(time * .00063 + label.phase2) * .035 * label.depth;
    ctx.save();
    ctx.translate(label.x, label.y);
    ctx.rotate(clamp(label.rotation, -.09, .09));
    ctx.scale(floatScale, floatScale);
    const size = Math.round((18 + energy * 12) * label.scale * (.92 + label.depth * .1));
    const colour = LANGUAGE_COLOURS[label.lang] || LANGUAGE_COLOURS.EN;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${size}px SFMono-Regular, "Hiragino Sans", "Apple SD Gothic Neo", "PingFang HK", Menlo, monospace`;
    ctx.fillStyle = `rgba(${colour.join(",")},${clamp(.035 + energy * .045, 0, .1)})`;
    ctx.fillText(label.word, -label.vx * 3.2, -label.vy * 3.2);
    ctx.shadowColor = `rgba(${colour.join(",")},.22)`;
    ctx.shadowBlur = 4 + label.depth * 5;
    ctx.fillStyle = `rgba(${colour.join(",")},${clamp(label.alpha + energy * .38, 0, .9)})`;
    ctx.fillText(label.word, 0, 0);
    ctx.shadowBlur = 0;
    ctx.font = `700 ${Math.max(7, Math.round(size * .34))}px SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = `rgba(${colour.join(",")},${clamp(label.alpha + energy * .25, 0, .72)})`;
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
    const gradient = ctx.createLinearGradient(
      wave.x - wave.radius,
      wave.y,
      wave.x + wave.radius,
      wave.y
    );
    gradient.addColorStop(0, `rgba(0,174,202,${Math.max(0, wave.life) * .58})`);
    gradient.addColorStop(.45, `rgba(49,92,255,${Math.max(0, wave.life) * .86})`);
    gradient.addColorStop(.72, `rgba(101,88,232,${Math.max(0, wave.life) * .72})`);
    gradient.addColorStop(1, `rgba(46,131,207,${Math.max(0, wave.life) * .48})`);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.15;
    ctx.shadowColor = `rgba(49,92,255,${Math.max(0, wave.life) * .34})`;
    ctx.shadowBlur = 9;
    ctx.beginPath();
    const points = 280;
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
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(audio.destination);
    activeBufferSource = source;
    source.addEventListener("ended", () => {
      if (activeBufferSource === source) activeBufferSource = null;
    }, { once: true });
    document.querySelector("#audio-source").textContent = `auto : ${current().jyutping} @ ${current().start.toFixed(2)}s`;
    source.start(0, Math.min(current().start, Math.max(0, buffer.duration - .01)));
    audio.resume().catch(() => {
      if (requestId !== playbackId) return;
      try { source.stop(); } catch (_) {}
      playCachedRecording(requestId);
    });
  } else {
    playCachedRecording(requestId);
  }
  energy = 1;
}

function animate(time) {
  const dt = clamp(time - lastTime || 16.67, 1, 34);
  lastTime = time;
  energy *= Math.pow(.974, dt / 16.67);
  mouse.speed *= Math.pow(.84, dt / 16.67);
  drawBackground(time);
  drawCopies(time, dt);
  drawParticles(dt);
  drawShockwaves(dt, time);
  if (time - lastHudUpdate > 80) {
    updateHud();
    lastHudUpdate = time;
  }
  requestAnimationFrame(animate);
}

canvas.addEventListener("pointermove", pointerMove);
canvas.addEventListener("pointerleave", pointerLeave);
canvas.addEventListener("pointerdown", event => {
  pointerMove(event);
  burst(mouse.x, mouse.y, 1.1);
  playRecording();
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
const cachedRecordings = Promise.all(recordings.map(recording => new Promise(resolve => {
  if (recording.readyState >= 3) resolve();
  else {
    recording.addEventListener("canplay", resolve, { once: true });
    recording.addEventListener("error", resolve, { once: true });
  }
})));
cachedRecordings.then(prepareAudioBuffers);
requestAnimationFrame(() => {
  resize();
  requestAnimationFrame(animate);
});
