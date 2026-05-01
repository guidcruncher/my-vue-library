<script setup lang="ts">
import { ref } from 'vue'
import { useSynthEngine } from '@/composables/useSynth'

// --- ENGINE ---
const engine = useSynthEngine({
  polyphony: 12,
  waveform: 'sawtooth',
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.3 },
  filter: { mode: 'lowpass', frequency: 800, q: 1.2 },
})

// --- KEYBOARD RANGE ---
const startNote = 48 // C3
const endNote = 72 // C5

// White/black key detection
const isBlack = (note: number) => {
  const mod = note % 12
  return [1, 3, 6, 8, 10].includes(mod)
}

// Active notes for UI highlighting
const activeNotes = ref(new Set<number>())

const noteOn = (note: number) => {
  activeNotes.value.add(note)
  engine.noteOn(note)
}

const noteOff = (note: number) => {
  activeNotes.value.delete(note)
  engine.noteOff(note)
}

const keys = Array.from({ length: endNote - startNote + 1 }, (_, i) => startNote + i)
</script>

<template>
  <div class="keyboard">
    <div
      v-for="note in keys"
      :key="note"
      class="key"
      :class="{
        black: isBlack(note),
        white: !isBlack(note),
        active: activeNotes.has(note),
      }"
      @mousedown="noteOn(note)"
      @mouseup="noteOff(note)"
      @mouseleave="noteOff(note)"
      @touchstart.prevent="noteOn(note)"
      @touchend.prevent="noteOff(note)"
    >
      <!-- Optional label -->
      <span class="label" v-if="!isBlack(note)">
        {{ note }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  position: relative;
  display: flex;
  height: 180px;
  user-select: none;
}

.key {
  position: relative;
  border: 1px solid #333;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-size: 10px;
  padding-bottom: 4px;
  box-sizing: border-box;
}

.white {
  width: 40px;
  background: #fafafa;
  z-index: 1;
}

.white.active {
  background: #cce0ff;
}

.black {
  width: 28px;
  height: 110px;
  background: #222;
  position: absolute;
  margin-left: -14px;
  z-index: 2;
}

.black.active {
  background: #5588ff;
}

.label {
  opacity: 0.4;
  pointer-events: none;
}
</style>
