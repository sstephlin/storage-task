export const playOverheatSound = (audioContext) => {
  if (!audioContext) return;
  const ctx = audioContext;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.6);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.9);
  osc.frequency.exponentialRampToValueAtTime(300, now + 1.2);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 1.1);
  gainNode.gain.linearRampToValueAtTime(0, now + 1.2);
  osc.type = "square";
  osc.start(now);
  osc.stop(now + 1.2);
};

export const playPowerDownSound = (audioContext) => {
  if (!audioContext) return;
  const ctx = audioContext;
  const now = ctx.currentTime;
  const tones = [
    { f0: 320, f1: 240, start: 0.0 },
    { f0: 240, f1: 170, start: 0.55 },
    { f0: 170, f1: 120, start: 1.1 },
  ];
  const toneDur = 0.6;
  tones.forEach(({ f0, f1, start }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "square";
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.frequency.setValueAtTime(f0, now + start);
    osc.frequency.exponentialRampToValueAtTime(f1, now + start + toneDur);
    gainNode.gain.setValueAtTime(0, now + start);
    gainNode.gain.linearRampToValueAtTime(0.3, now + start + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.28, now + start + toneDur - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, now + start + toneDur);
    osc.start(now + start);
    osc.stop(now + start + toneDur + 0.02);
  });
};

export const playSuccessSound = (audioContext) => {
  if (!audioContext) return;
  const ctx = audioContext;
  const now = ctx.currentTime;

  const notes = [
    { freq: 523.25, start: 0.0 },
    { freq: 659.25, start: 0.15 },
    { freq: 783.99, start: 0.3 },
    { freq: 1046.5, start: 0.45 },
  ];

  const noteDur = 0.2;

  notes.forEach(({ freq, start }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "sine";
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.frequency.setValueAtTime(freq, now + start);

    gainNode.gain.setValueAtTime(0, now + start);
    gainNode.gain.linearRampToValueAtTime(0.2, now + start + 0.02);
    gainNode.gain.linearRampToValueAtTime(0.15, now + start + noteDur - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + start + noteDur);

    osc.start(now + start);
    osc.stop(now + start + noteDur);
  });
};
