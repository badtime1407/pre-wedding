<script setup>
import { ref, onMounted } from "vue"

const bookings = ref([])
const loading = ref(true)
const error = ref("")

onMounted(async () => {
  try {
    const token = localStorage.getItem("token")

    const res = await fetch("http://localhost:8787/bookings/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      throw new Error("โหลดข้อมูลไม่สำเร็จ")
    }

    bookings.value = await res.json()

  } catch (err) {
    error.value = "ไม่สามารถโหลดสถานะได้"
  } finally {
    loading.value = false
  }
})

function statusColor(status) {
  if (status === "confirmed") return "bg-green-100 text-green-700"
  if (status === "completed") return "bg-blue-100 text-blue-700"
  if (status === "cancelled") return "bg-red-100 text-red-700"
  return "bg-gray-100 text-gray-700"
}

function statusText(status) {
  if (status === "confirmed") return "ยืนยันแล้ว"
  if (status === "completed") return "เสร็จสิ้น"
  if (status === "cancelled") return "ยกเลิก"
  return "ไม่ทราบสถานะ"
}
</script>

<template>
  <div class="min-h-screen bg-[#f6f8f6] py-16 px-6">

    <h1 class="text-3xl font-bold text-center mb-12">
      สถานะการจัดงานของฉัน
    </h1>

    <!-- Loading -->
    <div v-if="loading" class="text-center">
      กำลังโหลด...
    </div>

    <!-- Error -->
    <div v-if="error" class="text-center text-red-500">
      {{ error }}
    </div>

    <!-- ไม่มีข้อมูล -->
    <div v-if="!loading && bookings.length === 0"
         class="text-center text-gray-500">
      ยังไม่มีการจอง
    </div>

    <!-- รายการจอง -->
    <div class="max-w-4xl mx-auto space-y-6">

      <div v-for="booking in bookings"
           :key="booking.id"
           class="bg-white rounded-xl shadow-md p-6 border">

        <div class="flex justify-between items-center mb-4">
          <div>
            <p class="font-semibold text-lg">
              📅 {{ booking.date }}
            </p>
            <p class="text-gray-600">
              🕒 {{ booking.time }}
            </p>
          </div>

          <span
            class="px-4 py-2 rounded-full text-sm font-medium"
            :class="statusColor(booking.status)"
          >
            {{ statusText(booking.status) }}
          </span>
        </div>

        <div class="text-sm text-gray-600">
          <p>ชื่อผู้สมัคร : {{ booking.customer_name }}</p>
          <p>เบอร์โทรติดต่อ : {{ booking.customer_phone }}</p>
        </div>

      </div>

    </div>

  </div>
</template>
