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
  <div class="bg-[#faf7f3] min-h-screen">
    <div class="max-w-7xl mx-auto py-20 px-6">

      <!-- หัวข้อ -->
      <div class="text-center mb-14">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-[#2c2218]">
          ภาพผลงาน
        </h1>
        <p class="text-sm text-[#9e8e80] mt-3">รวมโมเมนต์ประทับใจที่เราได้บันทึกไว้</p>
      </div>

      <!-- Masonry -->
      <div class="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">

        <div v-for="(img, index) in images" :key="index" class="break-inside-avoid overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition duration-300">
          <img
            :src="img"
            class="w-full transition duration-500 hover:scale-[1.03]"
          />
        </div>
      </div>

    </div>
  </div>
</template>