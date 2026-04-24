<template>
    <div class="analog-clock-wrapper">
      <div class="analog-clock" :style="clockPanelStyle">
        <svg :width="size" :height="size" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="50"
            :fill="faceColor || 'var(--surface-bg)'"
            :stroke="borderColor || 'var(--surface-border)'"
            stroke-width="1"
          />

          <g class="minute-markers">
            <line
              v-for="m in 60"
              :key="m"
              x1="50"
              y1="2"
              x2="50"
              y2="4"
              :stroke="markerColor || 'var(--text-tertiary)'"
              stroke-width="0.5"
              :transform="`rotate(${m * 6} 50 50)`"
            />
          </g>

          <g class="hour-markers">
            <line
              v-for="h in 12"
              :key="h"
              x1="50"
              y1="2"
              x2="50"
              y2="7"
              :stroke="markerColor || 'var(--text-secondary)'"
              stroke-width="1.5"
              :transform="`rotate(${(h * 30) % 360} 50 50)`"
            />
          </g>

          <g class="hour-numbers">
            <text
              v-for="h in 12"
              :key="h"
              :x="50 + 40 * Math.sin((h * 30 * Math.PI) / 180)"
              :y="50 - 40 * Math.cos((h * 30 * Math.PI) / 180) + 1.5"
              text-anchor="middle"
              alignment-baseline="middle"
              font-size="8"
              font-weight="bold"
              :fill="markerColor || 'var(--text-color)'"
              style="font-family: var(--font-family)"
            >
              {{ h }}
            </text>
          </g>

          <line
            class="hour-hand"
            x1="50"
            y1="55"
            x2="50"
            y2="28"
            :stroke="hourHandColor || 'var(--text-color)'"
            stroke-width="3"
            stroke-linecap="round"
            :transform="`rotate(${hourAngle} 50 50)`"
          />

          <line
            class="minute-hand"
            x1="50"
            y1="55"
            x2="50"
            y2="15"
            :stroke="minuteHandColor || 'var(--text-color)'"
            stroke-width="2"
            stroke-linecap="round"
            :transform="`rotate(${minuteAngle} 50 50)`"
          />

          <line
            class="second-hand"
            x1="50"
            y1="55"
            x2="50"
            y2="10"
            :stroke="secondHandColor || 'var(--sys-danger)'"
            stroke-width="1.5"
            stroke-linecap="round"
            :transform="`rotate(${secondAngle} 50 50)`"
          />

          <circle
            cx="50"
            cy="50"
            r="2.5"
            fill="var(--text-color)"
            stroke="var(--surface-bg)"
            stroke-width="0.5"
          />
        </svg>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  size?: string
  timezone?: string
  glide?: boolean
  faceColor?: string
  borderColor?: string
  markerColor?: string
  hourHandColor?: string
  minuteHandColor?: string
  secondHandColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '150',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  glide: false,
})

const emit = defineEmits(['tick'])
const prevTime = ref(new Date())
const currentTime = ref(new Date())
let interval: number

type TimeUnit = 'hour' | 'minute' | 'second'

function parseTimeComponent(date: Date, timezone: string, type: TimeUnit): number {
  const options: Intl.DateTimeFormatOptions = { timeZone: timezone, [type]: '2-digit' }
  if (type === 'hour') options.hourCycle = 'h23'
  const formatter = new Intl.DateTimeFormat('en-US', options)
  const formattedTime = formatter.format(date)
  const numericalString = formattedTime.replace(/[^0-9]/g, '')
  return parseInt(numericalString, 10) || 0
}

const hour = computed(() => parseTimeComponent(currentTime.value, props.timezone, 'hour'))
const minute = computed(() => parseTimeComponent(currentTime.value, props.timezone, 'minute'))
const second = computed(() => parseTimeComponent(currentTime.value, props.timezone, 'second'))
const milliseconds = computed(() => currentTime.value.getMilliseconds())
const fractionalSecond = computed(() => second.value + milliseconds.value / 1000)

const secondAngle = computed(() => (props.glide ? fractionalSecond.value * 6 : second.value * 6))
const minuteAngle = computed(() => minute.value * 6 + fractionalSecond.value * 0.1)
const hourAngle = computed(
  () => (hour.value % 12) * 30 + minute.value * 0.5 + fractionalSecond.value * (0.5 / 60),
)

const clockPanelStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))

onMounted(() => {
  const intervalDuration = props.glide ? 16 : 1000
  interval = window.setInterval(() => {
    prevTime.value = currentTime.value
    currentTime.value = new Date()
    if (prevTime.value.getMinutes() != currentTime.value.getMinutes()) {
      emit('tick')
    }
  }, intervalDuration)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style lang="scss" scoped>
.analog-clock-wrapper {
  --size: v-bind('props.size + "px"');
  display: flex;
  justify-content: center;
  align-items: center;

  .analog-clock {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0;
    width: var(--size);
    height: var(--size);
    /* Ensure the SVG handles the circular shape, no border on div needed */

    svg {
      display: block;
      shape-rendering: geometricPrecision;

      .hour-hand,
      .minute-hand {
        transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
      }
    }
  }
}
</style>
