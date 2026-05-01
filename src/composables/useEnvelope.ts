export interface EnvelopeOptions {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface Envelope {
  apply: (param: AudioParam, velocity?: number) => void;
  release: (param: AudioParam) => void;
}

export function useEnvelope(
  ctx: AudioContext,
  opts: EnvelopeOptions
): Envelope {
  const apply = (param: AudioParam, velocity = 1) => {
    const now = ctx.currentTime;

    param.cancelScheduledValues(now);
    param.setValueAtTime(0, now);

    // Attack
    param.linearRampToValueAtTime(velocity, now + opts.attack);

    // Decay → Sustain
    param.linearRampToValueAtTime(
      velocity * opts.sustain,
      now + opts.attack + opts.decay
    );
  };

  const release = (param: AudioParam) => {
    const now = ctx.currentTime;

    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(0, now + opts.release);
  };

  return { apply, release };
}
