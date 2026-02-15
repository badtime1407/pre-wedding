<script setup>
import { ref } from "vue"

const images = ref([
  "/G1.png",
  "/G2.png",
  "/G3.png",
  "/G4.png",
  "/G5.png",
  "/G6.png",
  "/G7.png",
  "/G8.png",
  "/G9.png",
  "/G13.png",
  "/G11.png",
  "/G12.png",
  "/G14.png",
  "/G10.png",
  "/G15.png",
])
</script>

<template>
  <div class="max-w-7xl mx-auto py-16 px-4">

    <!-- หัวข้อ -->
    <h1 class="text-3xl font-bold text-center mb-12">
      ภาพผลงาน
    </h1>

    <!-- Masonry -->
    <div class="columns-1 sm:columns-2 md:columns-3 gap-8 space-y-8">

      <div v-for="(img, index) in images" :key="index" class="break-inside-avoid">
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