<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const images = [
  "/1.png",
  "/2.png",
  "/3.png"
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

const gallery = [
  "/Pic1.png",
  "/Pic2.png",
  "/Pic3.png",
  "/Pic4.png",
  "/Pic5.png",
  "/Pic6.png",
]
</script>

<template>
  <div class="bg-[#faf7f3]">
    <!-- ================= Slider ================= -->
    <section class="relative w-full h-[70vh] min-h-[420px] overflow-hidden">

      <!-- รูป -->
      <img v-for="(img, index) in images" :key="index" :src="img"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
       :class="index === currentIndex ? 'opacity-100' : 'opacity-0'"/>

      <!-- เงาไล่สีด้านล่างให้กลืนกับเนื้อหาถัดไป -->
      <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/25 to-transparent pointer-events-none"/>

      <!-- ปุ่มซ้าย -->
      <button @click="prevSlide"
        class="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 hover:scale-105 transition">
        <img src="/left-arrow.png" alt="prev" class="w-5 h-5"/>
      </button>

      <!-- ปุ่มขวา -->
      <button @click="nextSlide"
        class="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 hover:scale-105 transition">
        <img src="/right-arrow.png" alt="next" class="w-5 h-5"/>
      </button>

      <!-- จุด indicator -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">

        <button v-for="(img, index) in images" :key="index" @click="goTo(index)"
          class="h-1.5 rounded-full transition-all"
          :class="
            index === currentIndex
              ? 'bg-white w-6'
              : 'bg-white/50 w-1.5 hover:bg-white/70'
          ">
        </button>
      </div>

    </section>

    <!-- ================= Services ================= -->
    <section class="py-20 md:py-28 px-6">

      <div class="text-center mb-14">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-[#2c2218]">
          บริการของเรา
        </h2>
        <p class="text-sm text-[#9e8e80] mt-3">เลือกแพ็กเกจที่ตรงกับวันสำคัญของคุณ</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl mx-auto">

        <!-- Card 1 -->
        <div class="group bg-white rounded-2xl border border-[#ede8e2] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div class="aspect-[4/3] overflow-hidden">
            <img src="/service1.png" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
          </div>

          <div class="p-6 text-center">
            <p class="font-semibold text-lg text-[#2c2218]">
              แพ็กเกจ Pre-wedding
            </p>

            <router-link to="/packagespre-wedding"
              class="mt-4 inline-block bg-[#3d2f22] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#2c2218] transition">
              รายละเอียด
            </router-link>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="group bg-white rounded-2xl border border-[#ede8e2] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div class="aspect-[4/3] overflow-hidden">
            <img src="/Pic17.png" class="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
          </div>

          <div class="p-6 text-center">
            <p class="font-semibold text-lg text-[#2c2218]">
              แพ็กเกจการจัดงาน
            </p>

            <router-link to="/packages"
              class="mt-4 inline-block bg-[#3d2f22] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#2c2218] transition">
              รายละเอียด
            </router-link>
          </div>
        </div>

      </div>

    </section>

    <!-- ================= Portfolio ================= -->
    <section class="py-20 md:py-24 px-6 bg-white">

      <div class="text-center mb-14">
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-[#2c2218]">
          ภาพถ่ายผลงาน
        </h2>
        <p class="text-sm text-[#9e8e80] mt-3">ตัวอย่างผลงานจากลูกค้าจริง</p>
      </div>

      <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        <div v-for="(img, i) in gallery" :key="i" class="aspect-[3/4] overflow-hidden rounded-2xl shadow-sm">
          <img :src="img" class="w-full h-full object-cover transition duration-500 hover:scale-105"/>
        </div>

      </div>

      <div class="text-center mt-12">
        <router-link to="/gallery"
          class="inline-block border border-[#3d2f22] text-[#3d2f22] text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#3d2f22] hover:text-white transition">
          ดูผลงานทั้งหมด
        </router-link>
      </div>
    </section>

  </div>
</template>
