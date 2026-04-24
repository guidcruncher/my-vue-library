<template>
  <div class="flip-card" :style="flipCardStyle">
    <svg
      :width="cardWidth"
      :height="cardHeight"
      :viewBox="`0 0 ${cardWidth} ${cardHeight}`"
      class="card top-card"
    >
      <defs>
        <linearGradient :id="`topGrad-${value}-${animKey}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2a2a2a" />
          <stop offset="100%" stop-color="#1f1f1f" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        :width="rectInnerWidth"
        :height="rectInnerHeight"
        rx="4"
        :fill="`url(#topGrad-${value}-${animKey})`"
      />
      <rect
        x="2"
        y="2"
        :width="rectInnerWidth"
        :height="rectInnerHeight"
        rx="4"
        fill="none"
        stroke="#3a3a3a"
        stroke-width="1"
      />
      <text
        :x="cardWidth / 2"
        :y="topTextY"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#ffffff"
        :font-size="fontSize"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        {{ value }}
      </text>
    </svg>

    <svg
      :width="cardWidth"
      :height="cardHeight"
      :viewBox="`0 0 ${cardWidth} ${cardHeight}`"
      class="card bottom-card"
    >
      <defs>
        <linearGradient :id="`bottomGrad-${value}-${animKey}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1f1f1f" />
          <stop offset="100%" stop-color="#151515" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        :width="rectInnerWidth"
        :height="rectInnerHeight"
        rx="4"
        :fill="`url(#bottomGrad-${value}-${animKey})`"
      />
      <rect
        x="2"
        y="2"
        :width="rectInnerWidth"
        :height="rectInnerHeight"
        rx="4"
        fill="none"
        stroke="#3a3a3a"
        stroke-width="1"
      />
      <text
        :x="cardWidth / 2"
        :y="bottomTextY"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#ffffff"
        :font-size="fontSize"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        {{ value }}
      </text>
    </svg>

    <div class="center-line" :style="centerLineStyle"></div>

    <svg
      v-if="isFlipping"
      :key="`top-flip-${animKey}`"
      :width="cardWidth"
      :height="cardHeight"
      :viewBox="`0 0 ${cardWidth} ${cardHeight}`"
      class="flipping top-flip"
    >
      <rect x="2" y="2" :width="rectInnerWidth" :height="rectInnerHeight" rx="4" fill="#2a2a2a" />
      <rect
        x="2"
        y="2"
        :width="rectInnerWidth"
        :height="rectInnerHeight"
        rx="4"
        fill="none"
        stroke="#3a3a3a"
        stroke-width="1"
      />
      <text
        :x="cardWidth / 2"
        :y="topTextY"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#ffffff"
        :font-size="fontSize"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        {{ prevValue }}
      </text>
    </svg>

    <svg
      v-if="isFlipping"
      :key="`bottom-flip-${animKey}`"
      :width="cardWidth"
      :height="cardHeight"
      :viewBox="`0 0 ${cardWidth} ${cardHeight}`"
      class="flipping bottom-flip"
    >
      <rect x="2" y="2" :width="rectInnerWidth" :height="rectInnerHeight" rx="4" fill="#1f1f1f" />
      <rect
        x="2"
        y="2"
        :width="rectInnerWidth"
        :height="rectInnerHeight"
        rx="4"
        fill="none"
        stroke="#3a3a3a"
        stroke-width="1"
      />
      <text
        :x="cardWidth / 2"
        :y="bottomTextY"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="#ffffff"
        :font-size="fontSize"
        font-family="Arial, sans-serif"
        font-weight="bold"
      >
        {{ value }}
      </text>
    </svg>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  value: { type: String, required: true },
  prevValue: { type: String, required: true },

  // Card Sizing Props
  cardWidth: { type: Number, default: 80 },
  cardHeight: { type: Number, default: 60 },
  fontSize: { type: Number, default: 72 },

  // Text Positioning Prop
  textOffsetY: { type: Number, default: 5 },

  // Center Line Props
  centerLineHeight: { type: Number, default: 1 },
  margin: { type: String, default: '0 4px' },
})

// Calculated properties for dynamic sizing
const totalHeight = computed(() => props.cardHeight * 2)
const rectInnerWidth = computed(() => props.cardWidth - 4) // Width minus 2px padding on each side
const rectInnerHeight = computed(() => props.cardHeight - 4) // Height minus 2px padding on each side

// Fixed the center line Y position to start exactly at the card boundary
const centerLineY = computed(() => props.cardHeight) // e.g., 60

// Text Y positions
const topTextY = computed(() => props.cardHeight + props.textOffsetY)
const bottomTextY = computed(() => 0 + props.textOffsetY)

// CSS inline styles for reactive dimensions
const flipCardStyle = computed(() => ({
  // Define CSS variables here to be consumed by the <style lang="scss"> block
  '--card-width': `${props.cardWidth}px`,
  '--card-height': `${props.cardHeight}px`,
  '--total-height': `${totalHeight.value}px`,
  '--center-line-height': `${props.centerLineHeight}px`,
  '--rect-inner-width': `${rectInnerWidth.value}px`,
  width: `var(--card-width)`,
  height: `var(--total-height)`,
  margin: props.margin,
}))

// Center line styles (still needed for top, width, and height if not using CSS vars in style block)
const centerLineStyle = computed(() => ({
  top: `${centerLineY.value}px`,
  width: `var(--rect-inner-width)`, // Now using CSS variable
  height: `var(--center-line-height)`, // Now using CSS variable
}))

// Animation helpers
const isFlipping = computed(() => props.value !== props.prevValue)
const animKey = ref(0)

watch(isFlipping, (newVal) => {
  if (newVal) animKey.value++
})
</script>

<style lang="scss" scoped>
svg {
  shape-rendering: geometricPrecision;
}

@keyframes flipTop {
  from {
    transform: rotateX(0deg);
  }
  to {
    transform: rotateX(-90deg);
  }
}
@keyframes flipBottom {
  from {
    transform: rotateX(90deg);
  }
  to {
    transform: rotateX(0deg);
  }
}

.flip-card {
  position: relative;
  /* width, height, and margin are set by inline style using CSS variables */
  perspective: 1000px;
  transform-style: preserve-3d;
}

.card {
  position: absolute;
  left: 0;
  overflow: hidden;
  z-index: 1;
}

.top-card {
  top: 0;
}
.bottom-card {
  /* Use CSS variable */
  top: var(--card-height);
}

.center-line {
  position: absolute;
  /* top, width, and height are set by inline style on the element */
  left: 2px;
  background: #0a0a0a;
  z-index: 5;
}

.flipping {
  position: absolute;
  left: 0;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.top-flip {
  top: 0;
  z-index: 3;
  transform-origin: center bottom;
  animation: flipTop 0.3s ease-in forwards;
}

.bottom-flip {
  /* Use CSS variable */
  top: var(--card-height);
  z-index: 2;
  transform-origin: center top;
  transform: rotateX(90deg);
  animation: flipBottom 0.3s 0.3s ease-out forwards;
}
</style>
