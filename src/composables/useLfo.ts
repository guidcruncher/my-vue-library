export interface LfoOptions {
  frequency: number
  depth: number
  waveform?: OscillatorType
}

export interface Lfo {
  osc: OscillatorNode
  gain: GainNode
  start: () => void
  stop: () => void
}

export function useLfo(ctx: AudioContext, opts: LfoOptions): Lfo {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = opts.waveform ?? 'sine'
  osc.frequency.value = opts.frequency

  gain.gain.value = opts.depth

  osc.connect(gain)

  const start = () => {
    osc.start(ctx.currentTime)
  }

  const stop = () => {
    osc.stop(ctx.currentTime + 0.05)
  }

  return {
    osc,
    gain,
    start,
    stop,
  }
}
