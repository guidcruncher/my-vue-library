<script setup lang="ts">
import { computed } from 'vue'
import { useSynthEngine } from '@/composables/useSynthEngine'
import { useSynthUI } from '@/composables/useSynthUI'
import { usePatchStorage } from '@/composables/usePatchStorage'

// ENGINE
const engine = useSynthEngine({
  polyphony: 8,
  waveform: 'sawtooth',
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.3 },
  filter: { mode: 'lowpass', frequency: 800, q: 1.2 },
})

// PATCH STORAGE
const storage = usePatchStorage({
  namespace: 'synth-patches',
  version: 1,
})

// UI LAYER
const ui = useSynthUI({ engine, storage })

// PATCH NAME INPUT
const patchName = ref('My Patch')

// Helpers
const patchList = computed(() => storage.patches.value.map((p) => p.name))
</script>

<template>
  <div class="synth-panel">
    <!-- FILTER SECTION -->
    <section class="panel-section">
      <h2>Filter</h2>

      <label>Mode</label>
      <select v-model="ui.filterMode" @change="ui.bindFilter()">
        <option value="lowpass">Lowpass</option>
        <option value="highpass">Highpass</option>
        <option value="bandpass">Bandpass</option>
        <option value="notch">Notch</option>
      </select>

      <label>Frequency</label>
      <input type="range" min="50" max="20000" v-model="ui.filterFreq" @input="ui.bindFilter()" />

      <label>Resonance (Q)</label>
      <input
        type="range"
        min="0.1"
        max="20"
        step="0.1"
        v-model="ui.filterQ"
        @input="ui.bindFilter()"
      />
    </section>

    <!-- ENVELOPE SECTION -->
    <section class="panel-section">
      <h2>Envelope</h2>

      <label>Attack</label>
      <input type="range" min="0" max="2" step="0.01" v-model="ui.attack" />

      <label>Decay</label>
      <input type="range" min="0" max="2" step="0.01" v-model="ui.decay" />

      <label>Sustain</label>
      <input type="range" min="0" max="1" step="0.01" v-model="ui.sustain" />

      <label>Release</label>
      <input type="range" min="0" max="3" step="0.01" v-model="ui.release" />
    </section>

    <!-- LFO SECTION -->
    <section class="panel-section">
      <h2>LFO</h2>

      <label>Frequency</label>
      <input type="range" min="0.1" max="20" step="0.1" v-model="ui.lfoFreq" />

      <label>Depth</label>
      <input type="range" min="0" max="1000" step="1" v-model="ui.lfoDepth" />

      <button @click="ui.createLfoRoute(engine.setFilter.frequency)">
        Modulate Filter Frequency
      </button>
    </section>

    <!-- PATCH SECTION -->
    <section class="panel-section">
      <h2>Patches</h2>

      <input v-model="patchName" placeholder="Patch name" />

      <button @click="ui.savePatch(patchName)">Save Patch</button>

      <select v-model="patchName">
        <option v-for="p in patchList" :key="p" :value="p">{{ p }}</option>
      </select>

      <button @click="ui.loadPatch(patchName)">Load Patch</button>
    </section>

    <!-- KEYBOARD -->
    <section class="panel-section">
      <h2>Keyboard</h2>

      <div class="keyboard">
        <button @mousedown="engine.noteOn(60)" @mouseup="engine.noteOff(60)">C4</button>
        <button @mousedown="engine.noteOn(62)" @mouseup="engine.noteOff(62)">D4</button>
        <button @mousedown="engine.noteOn(64)" @mouseup="engine.noteOff(64)">E4</button>
        <button @mousedown="engine.noteOn(65)" @mouseup="engine.noteOff(65)">F4</button>
        <button @mousedown="engine.noteOn(67)" @mouseup="engine.noteOff(67)">G4</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.synth-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 24px;
}

.panel-section {
  border: 1px solid #444;
  padding: 16px;
  border-radius: 8px;
  background: #1a1a1a;
  color: #eee;
}

.panel-section h2 {
  margin-bottom: 12px;
}

.keyboard button {
  margin-right: 8px;
  padding: 8px 12px;
}
</style>
