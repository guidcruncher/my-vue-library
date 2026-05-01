import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useVoice } from './useVoice'
import { useSampleVoice } from './useSampleVoice'
import { useFilterNode } from './useFilterNode'
import { useLfo } from './useLfo'
import { useModMatrix } from './useModMatrix'
import { useArpeggiator } from './useArpeggiator'

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
  noteOn: (note: number, velocity?: number) => void
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
  filterNode: any
}

export function useSynthEngine(opts: SynthEngineOptions): SynthEngine {
  const ctx = ref<AudioContext | null>(null)
  const voices = new Map<number, ReturnType<typeof useVoice>>()
  const samples = new Map<string, AudioBuffer>()

  const filter = ref<ReturnType<typeof useFilterNode> | null>(null)
  const modMatrix = useModMatrix()
  let arp: ReturnType<typeof useArpeggiator> | null = null

  const noteToFreq = (note: number) => 440 * Math.pow(2, (note - 69) / 12)

  const noteOn = (note: number, velocity = 1) => {
    if (!ctx.value || voices.has(note)) return

    const freq = noteToFreq(note)

    const voice = useVoice(ctx.value, {
      waveform: opts.waveform ?? 'sawtooth',
      frequency: freq,
      velocity,
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
      setTimeout(() => noteOff(note), 100)
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
    filterNode: filter,
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
