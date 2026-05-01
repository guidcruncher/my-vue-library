import { ref, onMounted, onBeforeUnmount } from 'vue'

// useEnvelope.ts
export interface EnvelopeConfig {
  attack: number
  decay: number
  sustain: number
  release: number
}

export interface Envelope {
  triggerOn: (gain: GainNode, ctx: AudioContext) => void
  triggerOff: (gain: GainNode, ctx: AudioContext) => void
}

export function useEnvelope(config: EnvelopeConfig): Envelope {
  const { attack, decay, sustain, release } = config

  const triggerOn = (gain: GainNode, ctx: AudioContext) => {
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(1, now + attack)
    gain.gain.linearRampToValueAtTime(sustain, now + attack + decay)
  }

  const triggerOff = (gain: GainNode, ctx: AudioContext) => {
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0, now + release)
  }

  return { triggerOn, triggerOff }
}

// useVoice.ts

export interface VoiceOptions {
  waveform: OscillatorType
  frequency: number
  envelope: EnvelopeConfig
  filterFrequency?: number
  filterQ?: number
}

export interface Voice {
  start: () => void
  stop: () => void
  setFrequency: (hz: number) => void
}

export function useVoice(ctx: AudioContext, opts: VoiceOptions): Voice {
  const env = useEnvelope(opts.envelope)

  const osc = ctx.createOscillator()
  osc.type = opts.waveform
  osc.frequency.value = opts.frequency

  const gain = ctx.createGain()
  gain.gain.value = 0

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = opts.filterFrequency ?? 20000
  filter.Q.value = opts.filterQ ?? 0

  osc.connect(filter).connect(gain).connect(ctx.destination)

  const start = () => {
    osc.start()
    env.triggerOn(gain, ctx)
  }

  const stop = () => {
    env.triggerOff(gain, ctx)
    osc.stop(ctx.currentTime + opts.envelope.release)
  }

  const setFrequency = (hz: number) => {
    osc.frequency.setValueAtTime(hz, ctx.currentTime)
  }

  return { start, stop, setFrequency }
}

// usePolySynth.ts

export interface PolySynth {
  noteOn: (note: number) => void
  noteOff: (note: number) => void
  activeVoices: Map<number, ReturnType<typeof useVoice>>
}

export function usePolySynth(voiceOptions: Omit<VoiceOptions, 'frequency'>): PolySynth {
  const ctx = ref<AudioContext | null>(null)
  const activeVoices = new Map<number, ReturnType<typeof useVoice>>()

  const noteToFreq = (note: number) => 440 * Math.pow(2, (note - 69) / 12)

  const noteOn = (note: number) => {
    if (!ctx.value) return
    if (activeVoices.has(note)) return

    const freq = noteToFreq(note)
    const voice = useVoice(ctx.value, { ...voiceOptions, frequency: freq })
    activeVoices.set(note, voice)
    voice.start()
  }

  const noteOff = (note: number) => {
    const voice = activeVoices.get(note)
    if (!voice) return
    voice.stop()
    activeVoices.delete(note)
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      ctx.value = new AudioContext()
    }
  })

  onBeforeUnmount(() => {
    ctx.value?.close()
    activeVoices.clear()
  })

  return { noteOn, noteOff, activeVoices }
}

// useStepSequencer.ts

export interface Step {
  note: number | null
  velocity: number
}

export interface StepSequencerOptions {
  bpm: number
  steps: Step[]
}

export interface StepSequencer {
  playing: boolean
  start: () => void
  stop: () => void
  onStep: (cb: (step: Step, index: number) => void) => void
}

export function useStepSequencer(opts: StepSequencerOptions): StepSequencer {
  const { bpm, steps } = opts

  const playing = ref(false)
  const stepIndex = ref(0)
  let intervalId: number | null = null

  let callback: ((step: Step, index: number) => void) | null = null

  const msPerStep = 60_000 / bpm / 4 // 16th notes

  const tick = () => {
    const step = steps[stepIndex.value]
    if (callback) callback(step, stepIndex.value)

    stepIndex.value = (stepIndex.value + 1) % steps.length
  }

  const start = () => {
    if (playing.value) return
    playing.value = true
    intervalId = window.setInterval(tick, msPerStep)
  }

  const stop = () => {
    playing.value = false
    if (intervalId !== null) clearInterval(intervalId)
    intervalId = null
  }

  const onStep = (cb: (step: Step, index: number) => void) => {
    callback = cb
  }

  onBeforeUnmount(() => stop())

  return { playing: playing.value, start, stop, onStep }
}

// useFilterNode.ts
export type FilterMode = BiquadFilterType // 'lowpass' | 'highpass' | ...

export interface FilterOptions {
  mode?: FilterMode
  frequency?: number
  q?: number
}

export interface FilterNodeApi {
  node: BiquadFilterNode
  setMode: (mode: FilterMode) => void
  setFrequency: (hz: number) => void
  setQ: (q: number) => void
}

export function useFilterNode(ctx: AudioContext, opts: FilterOptions = {}): FilterNodeApi {
  const node = ctx.createBiquadFilter()
  node.type = opts.mode ?? 'lowpass'
  node.frequency.value = opts.frequency ?? 10_000
  node.Q.value = opts.q ?? 0.7

  const setMode = (mode: FilterMode) => {
    node.type = mode
  }

  const setFrequency = (hz: number) => {
    node.frequency.setValueAtTime(hz, ctx.currentTime)
  }

  const setQ = (q: number) => {
    node.Q.setValueAtTime(q, ctx.currentTime)
  }

  return { node, setMode, setFrequency, setQ }
}

// useArpeggiator.ts

export type ArpDirection = 'up' | 'down' | 'updown' | 'random'

export interface ArpOptions {
  bpm: number
  notes: number[]
  division?: number // 1 = quarter, 2 = eighth, 4 = 16th...
  direction?: ArpDirection
}

export interface Arpeggiator {
  playing: Readonly<{ value: boolean }>
  start: () => void
  stop: () => void
  onNote: (cb: (note: number) => void) => void
}

export function useArpeggiator(opts: ArpOptions): Arpeggiator {
  const { bpm, notes } = opts
  const division = opts.division ?? 2
  const direction = opts.direction ?? 'up'

  const playing = ref(false)
  let intervalId: number | null = null
  let index = 0
  let forward = true
  let callback: ((note: number) => void) | null = null

  const msPerBeat = 60_000 / bpm
  const msPerStep = msPerBeat / division

  const nextIndex = () => {
    if (direction === 'up') {
      index = (index + 1) % notes.length
    } else if (direction === 'down') {
      index = (index - 1 + notes.length) % notes.length
    } else if (direction === 'updown') {
      if (forward) {
        index++
        if (index >= notes.length - 1) forward = false
      } else {
        index--
        if (index <= 0) forward = true
      }
    } else {
      index = Math.floor(Math.random() * notes.length)
    }
  }

  const tick = () => {
    if (!notes.length || !callback) return
    const note = notes[index]
    callback(note)
    nextIndex()
  }

  const start = () => {
    if (playing.value) return
    playing.value = true
    intervalId = window.setInterval(tick, msPerStep)
  }

  const stop = () => {
    playing.value = false
    if (intervalId !== null) clearInterval(intervalId)
    intervalId = null
  }

  const onNote = (cb: (note: number) => void) => {
    callback = cb
  }

  onBeforeUnmount(() => stop())

  return { playing, start, stop, onNote }
}

// useLfo.ts
export interface LfoOptions {
  frequency: number
  depth: number
  waveform?: OscillatorType
}

export interface Lfo {
  node: OscillatorNode
  gain: GainNode
  start: () => void
  stop: () => void
}

export function useLfo(ctx: AudioContext, opts: LfoOptions): Lfo {
  const osc = ctx.createOscillator()
  osc.type = opts.waveform ?? 'sine'
  osc.frequency.value = opts.frequency

  const gain = ctx.createGain()
  gain.gain.value = opts.depth

  osc.connect(gain)

  const start = () => osc.start()
  const stop = () => osc.stop()

  return { node: osc, gain, start, stop }
}

// useModMatrix.ts
export interface ModRoute {
  source: GainNode // e.g. LFO gain output
  target: AudioParam // e.g. filter.frequency
}

export interface ModMatrix {
  addRoute: (route: ModRoute) => void
  clear: () => void
}

export function useModMatrix(): ModMatrix {
  const routes: ModRoute[] = []

  const addRoute = (route: ModRoute) => {
    routes.push(route)
    route.source.connect(route.target)
  }

  const clear = () => {
    routes.forEach((r) => r.source.disconnect())
    routes.length = 0
  }

  return { addRoute, clear }
}

// useWavetableOsc.ts
export interface WavetableOptions {
  real: Float32Array
  imag: Float32Array
  frequency: number
}

export interface WavetableOsc {
  node: OscillatorNode
  start: () => void
  stop: () => void
  setFrequency: (hz: number) => void
}

export function useWavetableOsc(ctx: AudioContext, opts: WavetableOptions): WavetableOsc {
  const wave = ctx.createPeriodicWave(opts.real, opts.imag, { disableNormalization: false })
  const osc = ctx.createOscillator()
  osc.setPeriodicWave(wave)
  osc.frequency.value = opts.frequency

  const start = () => osc.start()
  const stop = () => osc.stop()
  const setFrequency = (hz: number) => {
    osc.frequency.setValueAtTime(hz, ctx.currentTime)
  }

  return { node: osc, start, stop, setFrequency }
}

// useSynthEngine.ts

export interface SynthEngineOptions {
  polyphony: number
  waveform?: OscillatorType
  envelope: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
  filter: {
    mode: BiquadFilterType
    frequency: number
    q: number
  }
}

export interface SynthEngine {
  noteOn: (note: number) => void
  noteOff: (note: number) => void
  setFilter: (opts: Partial<{ mode: BiquadFilterType; frequency: number; q: number }>) => void
  addLfo: (opts: {
    frequency: number
    depth: number
    waveform?: OscillatorType
  }) => ReturnType<typeof useLfo>
  addLfoRoute: (lfo: ReturnType<typeof useLfo>, target: AudioParam) => void
  loadSample: (name: string, buffer: AudioBuffer) => void
  triggerSample: (name: string) => void
  startArp: (notes: number[], bpm: number, division?: number) => void
  stopArp: () => void
}

export function useSynthEngine(opts: SynthEngineOptions): SynthEngine {
  const ctx = ref<AudioContext | null>(null)
  const voices = new Map<number, ReturnType<typeof useVoice>>()
  const samples = new Map<string, AudioBuffer>()

  const filter = ref<ReturnType<typeof useFilterNode> | null>(null)
  const modMatrix = useModMatrix()
  let arp: ReturnType<typeof useArpeggiator> | null = null

  const noteToFreq = (note: number) => 440 * Math.pow(2, (note - 69) / 12)

  const noteOn = (note: number) => {
    if (!ctx.value || voices.has(note)) return

    const freq = noteToFreq(note)

    const voice = useVoice(ctx.value, {
      waveform: opts.waveform ?? 'sawtooth',
      frequency: freq,
      envelope: opts.envelope,
      filterFrequency: opts.filter.frequency,
      filterQ: opts.filter.q,
    })

    voices.set(note, voice)
    voice.start()
  }

  const noteOff = (note: number) => {
    const v = voices.get(note)
    if (!v) return
    v.stop()
    voices.delete(note)
  }

  const setFilter = (f: Partial<{ mode: BiquadFilterType; frequency: number; q: number }>) => {
    if (!filter.value) return
    if (f.mode) filter.value.setMode(f.mode)
    if (f.frequency) filter.value.setFrequency(f.frequency)
    if (f.q) filter.value.setQ(f.q)
  }

  const addLfo = (lfoOpts: { frequency: number; depth: number; waveform?: OscillatorType }) => {
    if (!ctx.value) throw new Error('AudioContext not ready')
    const lfo = useLfo(ctx.value, lfoOpts)
    lfo.start()
    return lfo
  }

  const addLfoRoute = (lfo: ReturnType<typeof useLfo>, target: AudioParam) => {
    modMatrix.addRoute({ source: lfo.gain, target })
  }

  const loadSample = (name: string, buffer: AudioBuffer) => {
    samples.set(name, buffer)
  }

  const triggerSample = (name: string) => {
    if (!ctx.value) return
    const buffer = samples.get(name)
    if (!buffer) return

    const voice = useSampleVoice(ctx.value, {
      buffer,
      envelope: opts.envelope,
      filterFrequency: opts.filter.frequency,
      filterQ: opts.filter.q,
    })

    voice.start()
  }

  const startArp = (notes: number[], bpm: number, division = 2) => {
    if (arp) arp.stop()

    arp = useArpeggiator({ bpm, notes, division })
    arp.onNote((note) => {
      noteOn(note)
      setTimeout(() => noteOff(note), 100) // short gate
    })

    arp.start()
  }

  const stopArp = () => {
    arp?.stop()
    arp = null
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      ctx.value = new AudioContext()
      filter.value = useFilterNode(ctx.value, opts.filter)
    }
  })

  onBeforeUnmount(() => {
    ctx.value?.close()
    voices.clear()
    samples.clear()
    modMatrix.clear()
    arp?.stop()
  })

  return {
    noteOn,
    noteOff,
    setFilter,
    addLfo,
    addLfoRoute,
    loadSample,
    triggerSample,
    startArp,
    stopArp,
  }
}
