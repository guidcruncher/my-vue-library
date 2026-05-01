export interface ModRoute {
  source: AudioNode | AudioParam
  target: AudioParam
  ctx: AudioContext
}

export interface ModMatrix {
  routes: ModRoute[]
  addRoute: (route: ModRoute) => void
  clear: () => void
}

export function useModMatrix(): ModMatrix {
  const routes: ModRoute[] = []

  const addRoute = (route: ModRoute) => {
    const { source, target, ctx } = route

    const gain = ctx.createGain()
    gain.gain.value = 1

    if (source instanceof AudioParam) {
      // AudioParam → Gain → AudioParam
      ;(source as any).connect?.(gain)
    } else {
      source.connect(gain)
    }

    gain.connect(target)

    routes.push(route)
  }

  const clear = () => {
    routes.length = 0
  }

  return {
    routes,
    addRoute,
    clear,
  }
}
