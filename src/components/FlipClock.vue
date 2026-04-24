<template>
    <div class="clock-container" style="width:240px;height:auto">
      <div class="clock-card surface">
        <div class="time-display">
          <FlipCard
            :value="hours[0]"
            :prev-value="prevHours[0]"
            :card-width="cardWidth"
            :card-height="cardHeight"
            :font-size="fontSize"
            :text-offset-y="textOffsetY"
            :center-line-height="centerLineHeight"
            :margin="margin"
          />
          <FlipCard
            :value="hours[1]"
            :prev-value="prevHours[1]"
            :card-width="cardWidth"
            :card-height="cardHeight"
            :font-size="fontSize"
            :text-offset-y="textOffsetY"
            :center-line-height="centerLineHeight"
            :margin="margin"
          />

          <div class="colon">
            <div class="dot"></div>
            <div class="dot"></div>
          </div>

          <FlipCard
            :value="minutes[0]"
            :prev-value="prevMinutes[0]"
            :card-width="cardWidth"
            :card-height="cardHeight"
            :font-size="fontSize"
            :text-offset-y="textOffsetY"
            :center-line-height="centerLineHeight"
            :margin="margin"
          />
          <FlipCard
            :value="minutes[1]"
            :prev-value="prevMinutes[1]"
            :card-width="cardWidth"
            :card-height="cardHeight"
            :font-size="fontSize"
            :text-offset-y="textOffsetY"
            :center-line-height="centerLineHeight"
            :margin="margin"
          />

          <div v-if="showSeconds" class="colon">
            <div class="dot"></div>
            <div class="dot"></div>
          </div>

          <FlipCard
            v-if="showSeconds"
            :value="seconds[0]"
            :prev-value="prevSeconds[0]"
            :card-width="cardWidth"
            :card-height="cardHeight"
            :font-size="fontSize"
            :text-offset-y="textOffsetY"
            :center-line-height="centerLineHeight"
            :margin="margin"
          />
          <FlipCard
            v-if="showSeconds"
            :value="seconds[1]"
            :prev-value="prevSeconds[1]"
            :card-width="cardWidth"
            :card-height="cardHeight"
            :font-size="fontSize"
            :text-offset-y="textOffsetY"
            :center-line-height="centerLineHeight"
            :margin="margin"
          />
        </div>
      </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import FlipCard from './FlipCard.vue'

interface Props {
  timezone?: string
  showSeconds?: boolean
  cardWidth?: number
  cardHeight?: number
  fontSize?: number
  textOffsetY?: number
  centerLineHeight?: number
  margin?: string
}

const props = withDefaults(defineProps<Props>(), {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  showSeconds: false,
  cardWidth: 40,
  cardHeight: 40,
  fontSize: 42,
  textOffsetY: 5,
  centerLineHeight: 1,
  margin: '0 4px',
})

const emit = defineEmits(['tick'])

const tzDate = () => {
  const date = new Date()
  var invdate = new Date(date.toLocaleString('en-US', { timeZone: props.timezone }))
  var diff = date.getTime() - invdate.getTime()
  return new Date(date.getTime() - diff)
}

const time = ref(tzDate())
const prevTime = ref(tzDate())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    prevTime.value = time.value
    time.value = tzDate()
    if (time.value.getMinutes() != prevTime.value.getMinutes()) {
      emit('tick')
    }
  }, 1000)
})

onUnmounted(() => clearInterval(timer))

const formatNumber = (n) => String(n).padStart(2, '0')

const hours = computed(() => formatNumber(time.value.getHours()))
const minutes = computed(() => formatNumber(time.value.getMinutes()))
const seconds = computed(() => formatNumber(time.value.getSeconds()))

const prevHours = computed(() => formatNumber(prevTime.value.getHours()))
const prevMinutes = computed(() => formatNumber(prevTime.value.getMinutes()))
const prevSeconds = computed(() => formatNumber(prevTime.value.getSeconds()))
</script>

<style lang="scss" scoped>
.clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .clock-card {
    background: var(--surface-bg);
    backdrop-filter: blur(var(--surface-blur));
    border: var(--surface-border);
    padding: 10px;
    border-radius: var(--widget-radius);
    box-shadow: var(--dropdown-shadow);
  }

  .time-display {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0px;
  }

  .colon {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin: 0 10px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--text-color);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
