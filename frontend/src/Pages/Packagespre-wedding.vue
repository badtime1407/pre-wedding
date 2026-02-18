<script setup>
import { ref, onMounted } from "vue"

const packages = ref([])
const loading = ref(true)
const error = ref("")

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:8787/packages/type/pre-wedding")
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
      แพ็คเกจ Pre-Wedding
    </h1>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-lg">
      กำลังโหลด...
    </div>

    <!-- Error -->
    <div v-if="error" class="text-center text-red-500">
      {{ error }}
    </div>

    <!-- Packages -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
      >
        <!-- Image -->
        <img
          :src="pkg.image_url"
          class="w-full h-60 object-cover"
        />

        <!-- Content -->
        <div class="p-6 space-y-4">

          <h2 class="text-2xl font-semibold">
            {{ pkg.name }}
          </h2>

          <p class="text-gray-600 whitespace-pre-line">
            {{ pkg.description }}
          </p>

          <div class="text-2xl font-bold text-green-600">
            {{ pkg.price.toLocaleString() }} บาท
          </div>

          <button
            class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            ดูรายละเอียด
          </button>

        </div>
      </div>

    </div>

  </div>
</template>
