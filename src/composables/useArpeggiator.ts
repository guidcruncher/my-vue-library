export interface ArpeggiatorOptions {
  bpm: number
  notes: number[]
  division?: number // steps per beat (e.g., 2 = eighth notes)
}

export interface Arpeggiator {
  start: () => void
  stop: () => void
  onNote: (cb: (note: number) => void) => void
}

export function useArpeggiator(opts: ArpeggiatorOptions): Arpeggiator {
  let timer: number | null = null
  let idx = 0

  let noteCb: ((note: number) => void) | null = null

  const division = opts.division ?? 2
  const intervalMs = 60_000 / opts.bpm / division

  const tick = () => {
    if (opts.notes.length === 0) return

    const note = opts.notes[idx % opts.notes.length]
    idx++

    noteCb?.(note)

    timer = setTimeout(tick, intervalMs) as unknown as number
  }

  const start = () => {
    if (timer !== null) return
    idx = 0
    timer = setTimeout(tick, intervalMs) as unknown as number
  }

  const stop = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const onNote = (cb: (note: number) => void) => {
    noteCb = cb
  }

  return {
    start,
    stop,
    onNote,
  }
}
