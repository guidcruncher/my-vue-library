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
<script setup>
import { computed } from 'vue';
import { usePermission } from './composables/usePermission';

const permissionName = ref('notifications');
const status = usePermission(permissionName);

const statusColor = computed(() => {
  return {
    granted: 'text-green-600',
    denied: 'text-red-600',
    prompt: 'text-yellow-600'
  }[status.value] || 'text-gray-400';
});
</script>

<template>
  <div class="p-4 border rounded-lg">
    <h3 class="font-bold">Permission Tracker</h3>

    <select v-model="permissionName" class="mt-2 border rounded p-1">
      <option value="notifications">Notifications</option>
      <option value="camera">Camera</option>
      <option value="geolocation">Geolocation</option>
    </select>

    <p class="mt-4">
      Status for <span class="font-mono">{{ permissionName }}</span>:
      <span :class="statusColor" class="font-bold uppercase">
        {{ status }}
      </span>
    </p>
  </div>
</template>
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

### useNotification

Uses the browser Notification API if available and permitted.

```
<script setup>
import { useNotification } from './composables/useNotification';

const {
  isSupported,
  permission,
  requestPermission,
  showNotification
} = useNotification();

const notifyUser = async () => {
  if (permission.value === 'default') {
    await requestPermission();
  }

  if (permission.value === 'granted') {
    showNotification({
      title: 'New Message',
      body: 'You have received a new document in your inbox.',
      icon: '/vite.svg'
    });
  }
};
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-bold">Notification Controller</h1>

    <div class="mt-4 space-y-4">
      <p>Browser Support: {{ isSupported ? 'YES' : 'NO' }}</p>
      <p>Permission Status: <span class="font-mono">{{ permission }}</span></p>

      <button
        v-if="permission === 'default'"
        @click="requestPermission"
        class="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Enable Notifications
      </button>

      <button
        @click="notifyUser"
        class="bg-green-500 text-white px-4 py-2 rounded"
      >
        Send Test Notification
      </button>
    </div>
  </div>
</template>
```

### useCamera

Connect to the computer Camera if available and permitted

```
<script setup>
import { ref, watch } from 'vue';
import { useCamera } from './composables/useCamera';

const videoElement = ref(null);
const { stream, error, isPending, isActive, start, stop } = useCamera();

// When the stream becomes available, attach it to the video tag
watch(stream, (newStream) => {
  if (videoElement.value && newStream) {
    videoElement.value.srcObject = newStream;
  }
});
</script>

<template>
  <div class="camera-container">
    <div v-if="error" class="error-msg">
      Error: {{ error.message }}
    </div>

    <video
      ref="videoElement"
      autoplay
      playsinline
      class="video-preview"
      :class="{ 'is-active': isActive }"
    ></video>

    <div class="controls">
      <button v-if="!isActive" @click="start()" :disabled="isPending">
        {{ isPending ? 'Accessing Camera...' : 'Open Camera' }}
      </button>

      <button v-else @click="stop" class="btn-stop">
        Close Camera
      </button>
    </div>
  </div>
</template>

<style scoped>
.video-preview {
  width: 100%;
  max-width: 640px;
  background: #000;
  border-radius: 8px;
}
.error-msg { color: red; margin-bottom: 1rem; }
.controls { margin-top: 1rem; }
</style>
```

### useDragDrop

​In this example, we use the composable to move items from a "List" into a "Bin".

```
<script setup>
import { ref } from 'vue';
import { useDragDrop } from './composables/useDragDrop';

const items = ref([
  { id: 1, name: 'Finish Report' },
  { id: 2, name: 'Email Team' },
  { id: 3, name: 'Debug Composable' }
]);

const bin = ref([]);

const { isDragging, isOver, draggableProps, droppableProps } = useDragDrop();

const handleDrop = (data) => {
  // Remove from items and add to bin
  items.value = items.value.filter(i => i.id !== data.id);
  bin.value.push(data);
};
</script>

<template>
  <div class="flex gap-8 p-10">
    <div class="flex-1 border p-4 rounded bg-gray-50">
      <h2 class="font-bold mb-4">Tasks</h2>
      <div
        v-for="item in items"
        :key="item.id"
        v-bind="draggableProps(item)"
        class="p-3 mb-2 bg-white border rounded cursor-move shadow-sm hover:border-blue-500"
      >
        {{ item.name }}
      </div>
    </div>

    <div
      v-bind="droppableProps(handleDrop)"
      class="flex-1 border-2 border-dashed p-4 rounded transition-colors"
      :class="isOver ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'"
    >
      <h2 class="font-bold mb-4">Complete (Drop Here)</h2>
      <div v-for="item in bin" :key="item.id" class="p-2 text-gray-500">
        ✓ {{ item.name }}
      </div>
    </div>
  </div>
</template>
```

### useTimer

```
const timer = useTimer({
  intervalMs: 1000,
  onTick: (elapsed) => {
    console.log('Timer ticked at', elapsed, 'ms')
  }
})
```
