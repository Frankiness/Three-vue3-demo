<template>
  <div class="mask" v-show="show">
    <a-progress class="progress" type="circle" :percent="percent"/>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: true
  },
  percent: {
    type: Number,
    default: 0
  }
})
</script>

<style>
.mask {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10001;
  background-color: rgba(217, 215, 215, 0.5);
}

.progress {
  left: 50%;
  top: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10005;
}
</style>
