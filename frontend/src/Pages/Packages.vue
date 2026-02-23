<script setup>
import { ref, onMounted } from "vue"

const packages = ref([])
const loading = ref(true)
const error = ref("")
const selectedPackage = ref(null)

const openPopup = (pkg) => {
  selectedPackage.value = pkg
}

const closePopup = () => {
  selectedPackage.value = null
}

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/packages/type/event`)
    if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")

    packages.value = await res.json()
  } catch (err) {
    error.value = "ไม่สามารถโหลดแพ็คเกจได้"
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f6f8f6] py-16 px-6">

    <h1 class="text-4xl font-bold text-center mb-12">
      แพ็คเก็จการจัดงาน
    </h1>

    <!-- Error -->
    <div v-if="error" class="text-center text-red-500">
      {{ error }}
    </div>

    <!-- ไม่มีข้อมูล -->
    <div
      v-if="!loading && packages.length === 0"
      class="text-center text-gray-500"
    >
      ยังไม่มีแพ็คเกจ
    </div>

    <!-- Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">

      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 hover:-translate-y-1"
      >
        <!-- Image -->
        <img :src="pkg.image_url" class="w-full h-60 object-cover object-[center_25%]"/>

        <!-- Content -->
        <div class="p-6 space-y-4">

          <h2 class="text-2xl font-semibold">
            {{ pkg.name }}
          </h2>

          <p class="text-gray-600 text-sm line-clamp-3">
            {{ pkg.description }}
          </p>

          <div class="text-2xl font-bold text-green-600">
            {{ pkg.price.toLocaleString() }} บาท
          </div>

          <button
            @click="openPopup(pkg)"
            class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300"
          >
            ดูรายละเอียด
          </button>

        </div>
      </div>

    </div>

    <!--Popup -->
    <div
      v-if="selectedPackage"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn"
      @click.self="closePopup"
    >
      <div
        class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 relative transform transition duration-300 scale-100 animate-scaleIn max-h-[90vh] overflow-y-auto"
      >

        <!-- Close -->
        <button
          @click="closePopup"
          class="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
        >
          ✕
        </button>

        <!-- Image -->
        <img
          :src="selectedPackage.image_url"
          class="w-full h-120 object-cover object-[center_25%]"
        />

        <!-- Title -->
        <h2 class="text-3xl font-bold mb-4">
          {{ selectedPackage.name }}
        </h2>

        <!-- Description -->
        <p class="whitespace-pre-line text-gray-600 leading-relaxed">
          {{ selectedPackage.description }}
        </p>

        <!-- Price -->
        <div class="mt-6 text-3xl font-bold text-green-600">
          {{ selectedPackage.price.toLocaleString() }} บาท
        </div>

      </div>
    </div>

  </div>
</template>
