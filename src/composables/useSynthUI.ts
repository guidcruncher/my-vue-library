// useSynthUI.ts
import { ref, computed } from 'vue'
import type { SynthEngine } from './useSynth'

export interface SynthUIOptions {
  engine: SynthEngine
}

export interface SynthUI {
  // UI state
  filterMode: ReturnType<typeof ref<BiquadFilterType>>
  filterFreq: ReturnType<typeof ref<number>>
  filterQ: ReturnType<typeof ref<number>>

  attack: ReturnType<typeof ref<number>>
  decay: ReturnType<typeof ref<number>>
  sustain: ReturnType<typeof ref<number>>
  release: ReturnType<typeof ref<number>>

  lfoFreq: ReturnType<typeof ref<number>>
  lfoDepth: ReturnType<typeof ref<number>>

  // actions
  bindFilter: () => void
  bindEnvelope: () => void
  createLfoRoute: (target: AudioParam) => void

  // patching
  savePatch: () => Record<string, number | string>
  loadPatch: (patch: Record<string, number | string>) => void
}

export function useSynthUI(opts: SynthUIOptions): SynthUI {
  const { engine } = opts

  // FILTER UI STATE
  const filterMode = ref<BiquadFilterType>('lowpass')
  const filterFreq = ref(800)
  const filterQ = ref(1.2)

  // ENVELOPE UI STATE
  const attack = ref(0.01)
  const decay = ref(0.2)
  const sustain = ref(0.7)
  const release = ref(0.3)

  // LFO UI STATE
  const lfoFreq = ref(4)
  const lfoDepth = ref(200)

  // APPLY FILTER TO ENGINE
  const bindFilter = () => {
    engine.setFilter({
      mode: filterMode.value,
      frequency: filterFreq.value,
      q: filterQ.value,
    })
  }

  // APPLY ENVELOPE TO ENGINE
  const bindEnvelope = () => {
    // You already have envelope inside voices,
    // so this would update your engine config or re-init voices.
    // For now, we expose the values for your engine to consume.
  }

  // CREATE LFO ROUTE
  const createLfoRoute = (target: AudioParam) => {
    const lfo = engine.addLfo({
      frequency: lfoFreq.value,
      depth: lfoDepth.value,
    })

    engine.addLfoRoute(lfo, target)
  }

  // PATCH SAVE/LOAD
  const savePatch = () => ({
    filterMode: filterMode.value,
    filterFreq: filterFreq.value,
    filterQ: filterQ.value,
    attack: attack.value,
    decay: decay.value,
    sustain: sustain.value,
    release: release.value,
    lfoFreq: lfoFreq.value,
    lfoDepth: lfoDepth.value,
  })

  const loadPatch = (patch: Record<string, number | string>) => {
    if ('filterMode' in patch) filterMode.value = patch.filterMode as BiquadFilterType
    if ('filterFreq' in patch) filterFreq.value = Number(patch.filterFreq)
    if ('filterQ' in patch) filterQ.value = Number(patch.filterQ)

    if ('attack' in patch) attack.value = Number(patch.attack)
    if ('decay' in patch) decay.value = Number(patch.decay)
    if ('sustain' in patch) sustain.value = Number(patch.sustain)
    if ('release' in patch) release.value = Number(patch.release)

    if ('lfoFreq' in patch) lfoFreq.value = Number(patch.lfoFreq)
    if ('lfoDepth' in patch) lfoDepth.value = Number(patch.lfoDepth)

    bindFilter()
  }

  return {
    filterMode,
    filterFreq,
    filterQ,
    attack,
    decay,
    sustain,
    release,
    lfoFreq,
    lfoDepth,
    bindFilter,
    bindEnvelope,
    createLfoRoute,
    savePatch,
    loadPatch,
  }
}
