export interface VoiceOptions {
  waveform: OscillatorType
  frequency: number
  velocity: number
  envelope: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
  filterFrequency: number
  filterQ: number
}

export interface Voice {
  start: () => void
  stop: () => void
}

export function useVoice(ctx: AudioContext, opts: VoiceOptions): Voice {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  // Oscillator
  osc.type = opts.waveform
  osc.frequency.value = opts.frequency

  // Filter
  filter.type = 'lowpass'
  filter.frequency.value = opts.filterFrequency
  filter.Q.value = opts.filterQ

  // Gain envelope
  gain.gain.value = 0

  // Routing
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  const now = ctx.currentTime

  const start = () => {
    const { attack, decay, sustain } = opts.envelope

    // Envelope: attack → decay → sustain
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(opts.velocity, now + attack)
    gain.gain.linearRampToValueAtTime(opts.velocity * sustain, now + attack + decay)

    osc.start(now)
  }

  const stop = () => {
    const { release } = opts.envelope
    const t = ctx.currentTime

    gain.gain.cancelScheduledValues(t)
    gain.gain.setValueAtTime(gain.gain.value, t)
    gain.gain.linearRampToValueAtTime(0, t + release)

    osc.stop(t + release + 0.05)
  }

  return { start, stop }
}
