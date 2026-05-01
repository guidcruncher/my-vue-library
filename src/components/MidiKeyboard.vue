<script setup lang="ts">
import { ref } from 'vue'
import { useMidiKeyboard } from '@/composables/useMidiKeyboard'
import { useSynthEngine } from '@/composables/useSynthEngine'

const engine = useSynthEngine({
  polyphony: 8,
  waveform: 'sawtooth',
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.3 },
  filter: { mode: 'lowpass', frequency: 800, q: 1.2 },
})

const midi = useMidiKeyboard()

// Bind MIDI → Synth
midi.onNoteOn(({ note, velocity }) => engine.noteOn(note))
midi.onNoteOff(({ note }) => engine.noteOff(note))

// On‑screen keyboard notes
const keys = [
  { note: 60, label: 'C4' },
  { note: 62, label: 'D4' },
  { note: 64, label: 'E4' },
  { note: 65, label: 'F4' },
  { note: 67, label: 'G4' },
  { note: 69, label: 'A4' },
  { note: 71, label: 'B4' },
  { note: 72, label: 'C5' },
]

const isActive = (note: number) => midi.activeNotes.value.has(note)
</script>

<template>
  <div class="midi-keyboard">
    <div class="status">
      <span v-if="midi.connected">MIDI Connected</span>
      <span v-else>MIDI Not Available</span>
    </div>

    <div class="keys">
      <button
        v-for="k in keys"
        :key="k.note"
        class="key"
        :class="{ active: isActive(k.note) }"
        @mousedown="engine.noteOn(k.note)"
        @mouseup="engine.noteOff(k.note)"
        @mouseleave="engine.noteOff(k.note)"
      >
        {{ k.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.midi-keyboard {
  padding: 16px;
  background: #111;
  color: #eee;
  border-radius: 8px;
}

.status {
  margin-bottom: 12px;
  font-size: 14px;
  opacity: 0.8;
}

.keys {
  display: flex;
  gap: 8px;
}

.key {
  padding: 12px 16px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}

.key.active {
  background: #66aaff;
  border-color: #99cfff;
}
</style>
