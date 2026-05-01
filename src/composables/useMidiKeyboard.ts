import { ref, onMounted, onBeforeUnmount } from 'vue';

export interface MidiNoteEvent {
  note: number;
  velocity: number;
}

export interface MidiKeyboard {
  connected: ReturnType<typeof ref<boolean>>;
  activeNotes: ReturnType<typeof ref<Set<number>>>;
  onNoteOn: (cb: (ev: MidiNoteEvent) => void) => void;
  onNoteOff: (cb: (ev: MidiNoteEvent) => void) => void;
}

export function useMidiKeyboard(): MidiKeyboard {
  const connected = ref(false);
  const activeNotes = ref(new Set<number>());

  let noteOnCb: ((ev: MidiNoteEvent) => void) | null = null;
  let noteOffCb: ((ev: MidiNoteEvent) => void) | null = null;

  const handleMessage = (e: WebMidi.MIDIMessageEvent) => {
    const [status, note, velocity] = e.data;
    const cmd = status & 0xf0;

    if (cmd === 0x90 && velocity > 0) {
      activeNotes.value.add(note);
      noteOnCb?.({ note, velocity });
    } else if (cmd === 0x80 || (cmd === 0x90 && velocity === 0)) {
      activeNotes.value.delete(note);
      noteOffCb?.({ note, velocity });
    }
  };

  const init = async () => {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) return;

    const access = await navigator.requestMIDIAccess();
    connected.value = true;

    for (const input of access.inputs.values()) {
      input.addEventListener('midimessage', handleMessage);
    }

    access.onstatechange = () => {
      for (const input of access.inputs.values()) {
        input.addEventListener('midimessage', handleMessage);
      }
    };
  };

  const cleanup = () => {
    activeNotes.value.clear();
  };

  onMounted(() => void init());
  onBeforeUnmount(() => cleanup());

  const onNoteOn = (cb: (ev: MidiNoteEvent) => void) => (noteOnCb = cb);
  const onNoteOff = (cb: (ev: MidiNoteEvent) => void) => (noteOffCb = cb);

  return {
    connected,
    activeNotes,
    onNoteOn,
    onNoteOff,
  };
}
