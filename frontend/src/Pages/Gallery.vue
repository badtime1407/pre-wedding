<script setup>
import { ref } from "vue"

const images = ref([
  "/Pic1.png",
  "/Pic2.png",
  "/Pic3.png",
  "/Pic4.png",
  "/Pic5.png",
  "/Pic6.png",
  "/Pic7.png",
  "/Pic8.png",
  "/Pic9.png",
  "/Pic10.png",
  "/Pic11.png",
  "/Pic12.png",
  "/Pic13.png",
  "/Pic14.png",
  "/Pic15.png",
  "/Pic16.png",
  "/Pic17.png",
])
</script>

<template>
  <div class="max-w-7xl mx-auto py-16 px-4">

    <!-- หัวข้อ -->
    <h1 class="text-3xl font-bold text-center mb-12">
      ภาพผลงาน
    </h1>

    <!-- Masonry -->
    <div
      class="
        columns-1
        sm:columns-2
        md:columns-3
        gap-6
        space-y-6
      "
    >
      <div
        v-for="(img, index) in images"
        :key="index"
        class="break-inside-avoid"
      >
        <img
          :src="img"
          class="
            w-full
            rounded-xl
            shadow-md
            hover:shadow-xl
            transition
            duration-300
            hover:scale-[1.02]
          "
        />
      </div>
    </div>

  </div>
</template>