# Composable API

33 Utilities Reference

## Hardware & UI

[useBattery](#battery) [useVibrate](#vibrate) [useDeviceOrientation](#orientation) [useInfiniteScroll](#infinite-scroll) [useElementSize](#element-size) [useLogger](#logger) [useEventBus](#event-bus) [useCircularRingBuffer](#ring-buffer) [useIndexedDB](#indexeddb) [useScript](#script)

## Data & Sensors

[useStack](#stack) [useQueue](#queue) [usePriorityQueue](#p-queue) [useLinkedList](#linked-list) [useHistory](#history) [useSort](#sort) [useIdle](#idle) [usePermission](#permission) [useGeolocation](#geolocation)

## Network & Storage

[useFetch](#fetch) [useJsonWebSocket](#json-ws) [useStorage](#storage) [useCookie](#cookie) [useDebounce](#debounce) [useThrottleRef](#throttle) [useClickOutside](#click-outside) [useMediaQuery](#media-query) [useOnlineStatus](#online) [usePolling](#polling)

## Advanced Logic

[useOptimisticMutation](#optimistic) [useExponentialBackoff](#backoff) [useBinaryWebSocket](#binary-ws) [usePagination](#pagination)

# Composables Library

A collection of reusable Vue 3 logic for hardware APIs, data structures, and network patterns.

## Hardware & Layout

### useBattery

Hardware

Reactive interface for the browser's Battery Status API.

```
<script setup>
import { useBattery } from './composables/useBattery';
const { level, charging, supported } = useBattery();
</script>

<template>
  <div v-if="supported">
    Battery Level: {{ (level * 100).toFixed(0) }}%
    Status: {{ charging ? 'Charging' : 'Unplugged' }}
  </div>
</template>
```

### useVibrate

Triggers device vibration for haptic feedback.

```
<script setup>
import { useVibrate } from './composables/useVibrate';
const { vibrate, stop } = useVibrate();

// Pattern: Vibrate 200ms, Pause 100ms, Vibrate 200ms
const errorPulse = () => vibrate([200, 100, 200]);
</script>
```

### useDeviceOrientation

Tracks the device's physical rotation in 3D space.

```
<script setup>
const { alpha, beta, gamma } = useDeviceOrientation();
</script>
<template>
  <p>Tilt Front/Back (Beta): {{ beta?.toFixed(0) }}°</p>
</template>
```

### useInfiniteScroll

Uses Intersection Observer to trigger a callback when scrolling to the bottom of a list.

```
<script setup>
const sentinel = ref(null);
const { isFetching } = useInfiniteScroll(sentinel, loadMoreData);
</script>
<template>
  <div v-for="item in items">{{ item }}</div>
  <div ref="sentinel">{{ isFetching ? 'Loading...' : 'Scroll for more' }}</div>
</template>
```

### useElementSize

Reactive tracking of an element's width and height.

```
<script setup>
const container = ref(null);
const { width, height } = useElementSize(container);
</script>
```

### useLogger

Categorized logging with support for levels (info, warn, error).

```
<script setup>
const logger = useLogger('AuthModule');
logger.info('User Logged In', { userId: 123 });
</script>
```

### useEventBus

Global singleton for cross-component communication.

```
<script setup>
const { emit, on } = useEventBus();
on('theme:toggle', (val) => console.log(val));
</script>
```

### useCircularRingBuffer

Fixed-size array where new items overwrite the oldest.

```
const { push, orderedItems } = useCircularBuffer(10); // Keep last 10
```

### useIndexedDB

Async key-value storage in the browser's IndexedDB.

```
const { put, get } = useIndexedDB('AppDB', 'Settings');
await put({ id: 'volume', val: 80 });
```

### useScript

Asynchronously loads external Javascript files.

```
const { load, status } = useScript('https://cdn.com/lib.js');
await load();
```

## Data Structures & Sensors

### useStack

Reactive Last-In-First-Out (LIFO) stack.

```
const { push, pop, top } = useStack(['Page1']);
```

### useQueue

Reactive First-In-First-Out (FIFO) queue.

```
const { enqueue, dequeue, front } = useQueue();
```

### usePriorityQueue

Queue where items are ordered by priority level.

```
enqueue('High Priority Task', 1);
enqueue('Low Priority Task', 5);
```

### useLinkedList

Reactive linked list with array conversion for rendering.

```
const { append, toArray } = useLinkedList();
```

### useHistory

Adds Undo/Redo capabilities to any reactive ref.

```
const text = ref('init');
const { undo, redo, canUndo } = useHistory(text);
```

### useSort

Provides a sorted computed view of an array.

```
const { sortedData, toggleSort } = useSort(users, 'name');
```

### useIdle

Detects if the user has been inactive for a duration.

```
const isIdle = useIdle(60000); // 1 minute
```

### usePermission

Tracks browser permissions like 'camera' or 'notifications'.

```
const status = usePermission('notifications');
```

### useGeolocation

Reactive access to device GPS coordinates.

```
const { coords, error } = useGeolocation();
```

## Networking & Interaction

### useFetch

Clean Fetch API wrapper with loading and error states.

```
const { data, isPending, execute } = useFetch('/api/user');
```

### useJsonWebSocket

WebSocket wrapper with automatic JSON parsing.

```
const { data, send } = useJsonWebSocket('ws://api.example.com');
```

### useStorage

Syncs a ref with LocalStorage across tabs.

```
const theme = useStorage('app-theme', 'light');
```

### useCookie

Reactive document.cookie interface.

```
const consent = useCookie('cookies-accepted');
```

### useDebounce

Delays updating a ref until a pause in changes occurs.

```
const debouncedValue = useDebounce(userInput, 500);
```

### useThrottleRef

Limits the frequency of updates to a reactive ref.

```
const throttledValue = useThrottleRef(scrollPos, 100);
```

### useClickOutside

Detects clicks outside a referenced DOM element.

```
useClickOutside(modalRef, () => isOpen.value = false);
```

### useMediaQuery

Reactive CSS Media Query evaluation.

```
const isMobile = useMediaQuery('(max-width: 768px)');
```

### useOnlineStatus

Tracks navigator.onLine status.

```
const isOnline = useOnlineStatus();
```

### usePolling

Executes an async function on a set interval.

```
const { start, stop } = usePolling(fetchData, 5000);
```

## Advanced Resilience

### useOptimisticMutation

Updates UI immediately and rolls back if API call fails.

```
const { mutate } = useOptimisticMutation(items);
mutate(newList, async (val) => await api.save(val));
```

### useExponentialBackoff

Retries failed async tasks with increasing delay.

```
const { execute } = useExponentialBackoff();
const data = await execute(() => unstableService());
```

### useBinaryWebSocket

WebSocket specialized for Blob or ArrayBuffer data.

```
const { data } = useBinaryWebSocket(url, true); // use blobs
```

### usePagination

Slices an array into reactive pages.

```
const { paginatedData, next, prev } = usePagination(items, 10);
```
