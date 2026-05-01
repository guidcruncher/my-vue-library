export interface FilterOptions {
  mode: BiquadFilterType
  frequency: number
  q: number
}

export interface FilterNode {
  node: BiquadFilterNode
  setMode: (mode: BiquadFilterType) => void
  setFrequency: (freq: number) => void
  setQ: (q: number) => void
}

export function useFilterNode(ctx: AudioContext, opts: FilterOptions): FilterNode {
  const node = ctx.createBiquadFilter()

  node.type = opts.mode
  node.frequency.value = opts.frequency
  node.Q.value = opts.q

  const setMode = (mode: BiquadFilterType) => {
    node.type = mode
  }

  const setFrequency = (freq: number) => {
    node.frequency.setValueAtTime(freq, ctx.currentTime)
  }

  const setQ = (q: number) => {
    node.Q.setValueAtTime(q, ctx.currentTime)
  }

  return {
    node,
    setMode,
    setFrequency,
    setQ,
  }
}
