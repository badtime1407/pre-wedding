<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const images = [
  "/poster1.png",
  "/poster2.png",
  "/poster3.png"
]

const currentIndex = ref(0)
let intervalId = null

// เลื่อนไปขวา
const nextSlide = () => {
  currentIndex.value =
    (currentIndex.value + 1) % images.length
  resetAuto()
}

// เลื่อนไปซ้าย
const prevSlide = () => {
  currentIndex.value =
    (currentIndex.value - 1 + images.length) % images.length
  resetAuto()
}

// เลือกจุด
const goTo = (index) => {
  currentIndex.value = index
  resetAuto()
}

// เริ่ม auto
const startAuto = () => {
  intervalId = setInterval(() => {
    nextSlide()
  }, 4000)
}

// รีเซ็ต auto เมื่อกดเอง
const resetAuto = () => {
  clearInterval(intervalId)
  startAuto()
}

onMounted(() => {
  startAuto()
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div>
    <!-- ================= Slider ================= -->
    <section class="relative w-full h-100 mt-16 overflow-hidden">

      <!-- รูป -->
      <img v-for="(img, index) in images"
        :key="index"
        :src="img"
        class="absolute inset-0 w-full h-100 object-cover transition-opacity duration-1000"
        :class="index === currentIndex ? 'opacity-100' : 'opacity-0'"/>

      <!-- ปุ่มซ้าย -->
      <button @click="prevSlide" class="absolute left-5 top-1/2 -translate-y-1/2 hover:scale-110 transition">
        <img src="/left-arrow.png" alt="prev" class="w-10 h-10"/>
      </button>

      <!-- ปุ่มขวา -->
      <button @click="nextSlide" class="absolute right-5 top-1/2 -translate-y-1/2 hover:scale-110 transition">
        <img src="/right-arrow.png" alt="next" class="w-10 h-10"/>
      </button>

      <!-- จุด indicator -->
      <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">

        <button
          v-for="(img, index) in images"
          :key="index"
          @click="goTo(index)"
          class="w-3 h-3 rounded-full"
          :class="
            index === currentIndex
              ? 'bg-white'
              : 'bg-white/50'
          "
        ></button>
      </div>

    </section>

    <!-- ================= Services ================= -->
    <section class="py-16 mt-20">

      <h2 class="text-center text-2xl font-bold mb-14">
        บริการของเรา
      </h2>

      <div class="grid grid-cols-2 gap-20 max-w-6xl mx-auto px-2">

        <!-- Card 1 -->
        <div class="bg-[#D9D9D9] shadow-lg  rounded-lg overflow-hidden hover:shadow-xl transition">
          <img src="/service1.png" class="w-full h-65 object-cover"/>

          <div class="p-4 text-center">
            <p class="font-medium">
              แพ็กเกจ Pre-wedding
            </p>

            <router-link to="/packagespre-wedding" class="mt-3 inline-block bg-gray-200 px-4 py-1 rounded hover:bg-gray-300">รายละเอียด</router-link>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bg-[#D9D9D9] shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition">
          <img src="/service2.png" class="w-full h-65 object-cover"/>

          <div class="p-4 text-center">
            <p class="font-medium">
              แพ็กเกจถ่ายภาพ
            </p>

            <router-link to="/packages" class="mt-3 inline-block bg-gray-200 px-4 py-1 rounded hover:bg-gray-300">รายละเอียด</router-link>
          </div>
        </div>

      </div>

    </section>

    <div class="">
      <h2 class="text-center text-2xl font-bold mb-14">
        ภาพถ่ายผลงาน
      </h2>
    </div>

  </div>
</template>
