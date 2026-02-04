<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const images = [
  "/poster1.png",
  "/poster2.png",
  "/poster3.png"
]

const currentIndex = ref(0)
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    currentIndex.value =
      (currentIndex.value + 1) % images.length
  }, 4000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>

  <section class="relative w-full h-screen overflow-hidden mt-16">

    <img
      v-for="(img, index) in images"
      :key="index"
      :src="img"
      class="absolute inset-0 w-full h-100 object-cover transition-opacity duration-1000"
      :class="index === currentIndex ? 'opacity-100' : 'opacity-0'"
    />

  </section>

</template>