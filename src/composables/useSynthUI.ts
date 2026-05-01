import { ref } from 'vue';
import type { SynthEngine } from './useSynthEngine';
import type { PatchStorage } from './usePatchStorage';

export interface SynthUIOptions {
  engine: SynthEngine;
  storage: PatchStorage;
}

export interface SynthUI {
  // UI state
  filterMode: ReturnType<typeof ref<BiquadFilterType>>;
  filterFreq: ReturnType<typeof ref<number>>;
  filterQ: ReturnType<typeof ref<number>>;

  attack: ReturnType<typeof ref<number>>;
  decay: ReturnType<typeof ref<number>>;
  sustain: ReturnType<typeof ref<number>>;
  release: ReturnType<typeof ref<number>>;

  lfoFreq: ReturnType<typeof ref<number>>;
  lfoDepth: ReturnType<typeof ref<number>>;

  // actions
  bindFilter: () => void;
  createLfoRoute: (target: AudioParam) => void;

  // patching
  savePatch: (name: string) => void;
  loadPatch: (name: string) => void;
}

export function useSynthUI(opts: SynthUIOptions): SynthUI {
  const { engine, storage } = opts;

  // FILTER
  const filterMode = ref<BiquadFilterType>('lowpass');
  const filterFreq = ref(800);
  const filterQ = ref(1.2);

  // ENVELOPE
  const attack = ref(0.01);
  const decay = ref(0.2);
  const sustain = ref(0.7);
  const release = ref(0.3);

  // LFO
  const lfoFreq = ref(4);
  const lfoDepth = ref(200);

  const bindFilter = () => {
    engine.setFilter({
      mode: filterMode.value,
      frequency: filterFreq.value,
      q: filterQ.value,
    });
  };

  const createLfoRoute = (target: AudioParam) => {
    const lfo = engine.addLfo({
      frequency: lfoFreq.value,
      depth: lfoDepth.value,
    });
    engine.addLfoRoute(lfo, target);
  };

  const savePatch = (name: string) => {
    storage.savePatch(name, {
      filterMode: filterMode.value,
      filterFreq: filterFreq.value,
      filterQ: filterQ.value,
      attack: attack.value,
      decay: decay.value,
      sustain: sustain.value,
      release: release.value,
      lfoFreq: lfoFreq.value,
      lfoDepth: lfoDepth.value,
    });
  };

  const loadPatch = (name: string) => {
    const patch = storage.loadPatch(name);
    if (!patch) return;

    const d = patch.data;

    if ('filterMode' in d) filterMode.value = d.filterMode as BiquadFilterType;
    if ('filterFreq' in d) filterFreq.value = Number(d.filterFreq);
    if ('filterQ' in d) filterQ.value = Number(d.filterQ);

    if ('attack' in d) attack.value = Number(d.attack);
    if ('decay' in d) decay.value = Number(d.decay);
    if ('sustain' in d) sustain.value = Number(d.sustain);
    if ('release' in d) release.value = Number(d.release);

    if ('lfoFreq' in d) lfoFreq.value = Number(d.lfoFreq);
    if ('lfoDepth' in d) lfoDepth.value = Number(d.lfoDepth);

    bindFilter();
  };

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
    createLfoRoute,
    savePatch,
    loadPatch,
  };
}
