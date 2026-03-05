/**
 * 원숭이 성공 효과음 - 우끼끼 (Web Audio API 합성)
 * 미션 완료 시 재생되는 짧고 경쾌한 원숭이 소리 (기계음이 아닌 목소리 느낌)
 */
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioContext = new Ctx();
  }
  return audioContext;
}

/**
 * 한 번의 "우" 또는 "끼" 소리: 삼각파 + 살짝 떨리는 톤으로 목소리처럼
 */
function playMonkeySyllable(
  ctx: AudioContext,
  baseFreq: number,
  startTime: number,
  duration: number,
  gainValue: number
): void {
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  masterGain.gain.setValueAtTime(0, startTime);
  masterGain.gain.linearRampToValueAtTime(gainValue, startTime + 0.04);
  masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  // 주 오실레이터: 삼각파 (부드러운 목소리 느낌)
  const osc1 = ctx.createOscillator();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(baseFreq, startTime);
  osc1.frequency.linearRampToValueAtTime(
    baseFreq * 1.15,
    startTime + duration * 0.7
  );
  osc1.connect(masterGain);
  osc1.start(startTime);
  osc1.stop(startTime + duration);

  // 살짝 다른 톤으로 겹쳐서 “우끼” 느낌 (소량만)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(baseFreq * 1.5, startTime);
  osc2.detune.setValueAtTime(8, startTime);
  const subGain = ctx.createGain();
  subGain.gain.value = 0.2;
  osc2.connect(subGain);
  subGain.connect(masterGain);
  osc2.start(startTime);
  osc2.stop(startTime + duration);
}

/**
 * 미션 완료 시 재생: 원숭이가 우끼끼하며 즐거워하는 성공 효과음
 */
export function playMonkeySuccessSound(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') void ctx.resume();

    const now = ctx.currentTime;
    const vol = 0.22;

    // "우" — 낮은 톤, 조금 길게
    playMonkeySyllable(ctx, 320, now, 0.18, vol);
    // "끼" — 올라가는 톤
    playMonkeySyllable(ctx, 480, now + 0.22, 0.14, vol * 0.95);
    // "끼!" — 더 올라가서 마무리
    playMonkeySyllable(ctx, 620, now + 0.4, 0.16, vol * 0.9);
  } catch {
    // 오디오 미지원 환경 등에서는 무시
  }
}
