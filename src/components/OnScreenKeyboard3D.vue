<script setup lang="ts">
import { ref } from 'vue';
import { useSynthEngine } from '@/composables/useSynthEngine';

// --- ENGINE ---
const engine = useSynthEngine({
  polyphony: 12,
  waveform: 'sawtooth',
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.3 },
  filter: { mode: 'lowpass', frequency: 800, q: 1.2 },
});

// --- RANGE ---
const startNote = 48; // C3
const endNote = 72;   // C5

const isBlack = (note: number) => {
  const mod = note % 12;
  return [1, 3, 6, 8, 10].includes(mod);
};

const activeNotes = ref(new Set<number>());

const noteOn = (note: number) => {
  activeNotes.value.add(note);
  engine.noteOn(note);
};

const noteOff = (note: number) => {
  activeNotes.value.delete(note);
  engine.noteOff(note);
};

const keys = Array.from({ length: endNote - startNote + 1 }, (_, i) => startNote + i);
</script>

<template>
  <div class="keyboard-3d">
    <div
      v-for="note in keys"
      :key="note"
      class="key"
      :class="{
        black: isBlack(note),
        white: !isBlack(note),
        active: activeNotes.has(note)
      }"
      @mousedown="noteOn(note)"
      @mouseup="noteOff(note)"
      @mouseleave="noteOff(note)"
      @touchstart.prevent="noteOn(note)"
      @touchend.prevent="noteOff(note)"
    >
      <span class="label" v-if="!isBlack(note)">
        {{ note }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.keyboard-3d {
  position: relative;
  display: flex;
  height: 200px;
  padding: 20px;
  perspective: 900px;
  user-select: none;
  transform-style: preserve-3d;
}

/* Base key styling */
.key {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-size: 10px;
  padding-bottom: 6px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.08s ease, background 0.1s ease;
}

/* White keys */
.white {
  width: 48px;
  height: 180px;
  background: linear-gradient(#fafafa, #e5e5e5);
  border: 1px solid #bbb;
  border-radius: 4px;
  box-shadow:
    0 4px 0 #ccc,
    0 6px 12px rgba(0, 0, 0, 0.25);
}

.white.active {
  transform: translateZ(-6px);
  background: linear-gradient(#dce8ff, #c0d4ff);
  box-shadow:
    0 2px 0 #99b3ff,
    0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Black keys */
.black {
  width: 32px;
  height: 120px;
  background: linear-gradient(#222, #000);
  border-radius: 4px;
  position: absolute;
  margin-left: -16px;
  z-index: 2;
  box-shadow:
    0 3px 0 #111,
    0 6px 10px rgba(0, 0, 0, 0.4);
}

.black.active {
  transform: translateZ(-6px);
  background: linear-gradient(#445, #223);
  box-shadow:
    0 2px 0 #111,
    0 4px 6px rgba(0, 0, 0, 0.3);
}

/* Optional labels */
.label {
  opacity: 0.35;
  pointer-events: none;
}
</style>
