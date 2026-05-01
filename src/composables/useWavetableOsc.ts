export interface WavetableOscOptions {
  real: Float32Array
  imag: Float32Array
  frequency: number
}

export interface WavetableOsc {
  osc: OscillatorNode
  start: () => void
  stop: () => void
}

export function useWavetableOsc(ctx: AudioContext, opts: WavetableOscOptions): WavetableOsc {
  const wave = ctx.createPeriodicWave(opts.real, opts.imag, {
    disableNormalization: false,
  })

  const osc = ctx.createOscillator()
  osc.setPeriodicWave(wave)
  osc.frequency.value = opts.frequency

  const start = () => {
    osc.start(ctx.currentTime)
  }

  const stop = () => {
    osc.stop(ctx.currentTime + 0.05)
  }

  return {
    osc,
    start,
    stop,
  }
}
