# Vue Utility Library

Comprehensive Documentation of TypeScript Composables

## 1\. Network & Communication

Utilities for handling real-time data, API requests, and connectivity status.

WebSocket

### useBinaryWebSocket & useJsonWebSocket

Managed WebSocket connections with automatic cleanup and type-safe data handling.

const { data, status, send, connect } = useJsonWebSocket<MyType>(url);

HTTP

### useFetch

A reactive wrapper for the Fetch API with AbortController support and loading states.

const { data, isPending, execute, abort } = useFetch(url, options);

Browser

### useOnlineStatus

Reactive tracker for `navigator.onLine` to detect internet connectivity.

## 2\. Persistence & Storage

Utilities to sync reactive state with browser storage mechanisms.

### useStorage

Syncs a ref with `localStorage` or `sessionStorage` with automatic JSON serialization and cross-tab syncing.

const userSettings = useStorage('settings', { theme: 'dark' });

### useCookie

Reactive management of `document.cookie` with expiration and path configuration.

### useIndexedDB

A Promise-based wrapper for the low-level IndexedDB API for storing large structured data.

## 3\. Algorithmic Structures

Classic data structures implemented as reactive Vue refs.

FIFO

### useQueue

Standard Queue implementation (enqueue/dequeue) for sequential task processing.

LIFO

### useStack

Standard Stack implementation (push/pop) for navigation history or undo buffers.

Priority

### usePriorityQueue

Elements sorted by a priority weight; higher priority items are dequeued first.

History

### useHistory

An Undo/Redo state manager using a stack-based snapshot algorithm.

## 4\. Infrastructure & Eventing

Core architecture utilities for cross-component communication and debugging.

Singleton

### useEventBus

A type-safe Global Event Emitter (Pub/Sub) with automatic listener cleanup on component unmount.

const { pub, sub } = useEventBus();
sub('event', (data) => ...);
pub('event', payload);

Singleton

### useLogger

Namespaced console logger with log-level filtering, CSS formatting, and custom transport support.

const log = useLogger('Auth');
log.info('User logged in');

## 5\. Performance & Interaction

Optimization utilities and UI sensor wrappers.

| Composable | Use Case |
| --- | --- |
| `useDebounce` | Delay updates until activity stops (Search bars). |
| `useThrottleRef` | Limit update frequency (Scroll/Resize). |
| `useClickOutside` | Close dropdowns/modals when clicking away. |
| `useIdle` | Detect user inactivity for security or power saving. |

## 6\. Hardware & Browser APIs

Reactive wrappers for modern Web Hardware APIs.

### useBattery

Track battery level, charging state, and remaining time.

### useGeolocation

Watch physical GPS coordinates with error handling.

### useVibrate

Trigger haptic feedback patterns on mobile devices.

### useDeviceOrientation

Track Alpha, Beta, and Gamma tilt axes of the device.
