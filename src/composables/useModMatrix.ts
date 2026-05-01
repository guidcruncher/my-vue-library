export interface ModRoute {
  source: AudioNode | AudioParam;
  target: AudioParam;
}

export interface ModMatrix {
  routes: ModRoute[];
  addRoute: (route: ModRoute) => void;
  clear: () => void;
}

export function useModMatrix(): ModMatrix {
  const routes: ModRoute[] = [];

  const addRoute = (route: ModRoute) => {
    routes.push(route);

    if (route.source instanceof AudioParam) {
      // AudioParam → AudioParam is not directly connectable
      // Create a GainNode as a bridge
      const ctx = route.target.context;
      const gain = ctx.createGain();
      gain.gain.value = 1;

      // sourceParam → gain → targetParam
      route.source.connect(gain);
      gain.connect(route.target);
    } else {
      // AudioNode → AudioParam
      route.source.connect(route.target);
    }
  };

  const clear = () => {
    for (const r of routes) {
      try {
        if (r.source instanceof AudioParam) {
          // Cannot disconnect AudioParam directly
        } else {
          r.source.disconnect(r.target);
        }
      } catch {
        // ignore disconnect errors
      }
    }
    routes.length = 0;
  };

  return {
    routes,
    addRoute,
    clear,
  };
}
