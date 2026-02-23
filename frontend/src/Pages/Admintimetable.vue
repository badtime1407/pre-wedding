<script setup>
import { ref, computed, onMounted } from "vue"
import Sidebar from '../components/Sidebar.vue';

const bookings = ref([])
const loading = ref(true)
const selectedDate = ref(null)
const selectedDayBookings = ref([])
const showModal = ref(false)

const today = new Date()
const month = ref(today.getMonth())
const year = ref(today.getFullYear())

const thaiMonths = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน",
  "พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม",
  "กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
]

const thaiYear = computed(() => year.value + 543)
const thaiMonthName = computed(() => thaiMonths[month.value])

const daysInMonth = computed(() =>
  new Date(year.value, month.value + 1, 0).getDate()
)

const firstDay = computed(() =>
  new Date(year.value, month.value, 1).getDay()
)

onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()

    // เรียงตามวันที่ แล้วตามเวลา
    bookings.value = data.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.time.localeCompare(b.time)
    })

  } catch (err) {
    console.error("โหลดข้อมูลไม่ได้", err)
  } finally {
    loading.value = false
  }
})

function fullDate(day) {
  return `${year.value}-${String(month.value + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function getBookingsForDate(date) {
  return bookings.value.filter(b => b.date === date)
}

function prevMonth() {
  if (month.value === 0) { month.value = 11; year.value-- }
  else month.value--
}

function nextMonth() {
  if (month.value === 11) { month.value = 0; year.value++ }
  else month.value++
}

function openDay(day) {
  const date = fullDate(day)
  const dayBookings = getBookingsForDate(date)
  if (dayBookings.length === 0) return
  selectedDate.value = date
  selectedDayBookings.value = dayBookings
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedDate.value = null
}

function statusColor(status) {
  if (status === "confirmed") return "bg-green-100 text-green-700"
  if (status === "completed") return "bg-blue-100 text-blue-700"
  if (status === "cancelled") return "bg-red-100 text-red-700"
  return "bg-gray-100 text-gray-600"
}

function statusText(status) {
  if (status === "confirmed") return "ยืนยันแล้ว"
  if (status === "completed") return "เสร็จสิ้น"
  if (status === "cancelled") return "ยกเลิก"
  return "ไม่ทราบ"
}

function formatThaiDate(dateStr) {
  const [y, m, d] = dateStr.split("-")
  return `${parseInt(d)} ${thaiMonths[parseInt(m) - 1]} ${parseInt(y) + 543}`
}

</script>

<template>
  <div class="min-h-screen bg-[#f6eee1] flex">
    <Sidebar/>
    <div class="flex-1 p-8 overflow-auto">
    <!-- Header -->
    <div class="max-w-5xl mx-auto mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-[#3d2b1f]">ปฏิทินการจอง</h1>
      </div>
    </div>

    <!-- Calendar Card -->
    <div class="max-w-5xl mx-auto rounded-2xl shadow-lg overflow-hidden">

      <!-- Month Nav -->
      <div class=" text-black px-8 py-5 flex justify-between items-center">
        <button 
        @click="prevMonth" class="w-9 h-9 rounded-full hover:bg-white/20 transition flex items-center justify-center">
        <img 
            src="/left-arrow.png"  alt="Previous" class="w-5 h-5"/>
        </button>

        <span class="text-xl font-semibold tracking-wide">
        {{ thaiMonthName }} {{ thaiYear }}
        </span>

        <button 
        @click="nextMonth" class="w-9 h-9 rounded-full hover:bg-white/20 transition flex items-center justify-center">
        <img  src="/right-arrow.png"  alt="Next" class="w-5 h-5"/>
        </button>
        
      </div>

      <!-- Day Headers -->
      <div class="grid grid-cols-7 bg-[#f5f0e8]">
        <div v-for="d in ['อา','จ','อ','พ','พฤ','ศ','ส']" :key="d"
          class="py-3 text-center text-sm font-semibold text-[#7a6a5a]">
          {{ d }}
        </div>
      </div>

      <!-- Days Grid -->
      <div class="grid grid-cols-7 border-t border-[#e8e0d4]">
        <!-- Empty cells -->
        <div v-for="i in firstDay" :key="'e'+i"
          class="min-h-[100px] border-b border-r border-[#e8e0d4] bg-[#faf8f5]" />

        <!-- Day cells -->
        <div
          v-for="day in daysInMonth"
          :key="day"
          class="min-h-[100px] border-b border-r border-[#e8e0d4] p-2 transition"
          :class="[
            getBookingsForDate(fullDate(day)).length > 0
              ? 'cursor-pointer hover:bg-[#fdf6ec]'
              : 'bg-white',
            fullDate(day) === new Date().toISOString().slice(0,10)
              ? 'bg-amber-50'
              : ''
          ]"
          @click="openDay(day)"
        >
          <!-- Day number -->
          <div class="flex justify-between items-start mb-1">
            <span
              class="text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full"
              :class="fullDate(day) === new Date().toISOString().slice(0,10)
                ? 'bg-[#3d2b1f] text-white'
                : 'text-[#3d2b1f]'"
            >
              {{ day }}
            </span>
            <span
              v-if="getBookingsForDate(fullDate(day)).length > 0"
              class="text-xs bg-[#e7dcc7] text-[#3d2b1f] rounded-full px-1.5 py-0.5 font-medium"
            >
              {{ getBookingsForDate(fullDate(day)).length }}
            </span>
          </div>

          <!-- Booking pills -->
          <div class="space-y-1">
            <div
              v-for="(booking, i) in getBookingsForDate(fullDate(day)).slice(0, 3)"
              :key="i"
              class="text-xs px-2 py-0.5 rounded-md truncate"
              :class="statusColor(booking.status)"
            >
              {{ booking.customer_name }}
            </div>
            <div
              v-if="getBookingsForDate(fullDate(day)).length > 3"
              class="text-xs text-[#7a6a5a] pl-1"
            >
              +{{ getBookingsForDate(fullDate(day)).length - 3 }} เพิ่มเติม
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="max-w-5xl mx-auto mt-4 flex gap-4 text-sm text-[#7a6a5a]">
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-green-100 border border-green-300"></span> ยืนยันแล้ว
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300"></span> เสร็จสิ้น
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-red-100 border border-red-300"></span> ยกเลิก
      </div>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div v-if="showModal"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        @click.self="closeModal">

        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">

          <!-- Modal Header -->
          <div class="bg-[#3d2b1f] text-white px-6 py-4 flex justify-between items-center">
            <div>
              <p class="text-xs text-white/60 mb-0.5">รายการจอง</p>
              <h2 class="font-semibold text-lg">{{ formatThaiDate(selectedDate) }}</h2>
            </div>
            <button @click="closeModal"
              class="w-8 h-8 rounded-full hover:bg-white/20 transition flex items-center justify-center">
              ✕
            </button>
          </div>

          <!-- Modal Body -->
          <div class="overflow-y-auto p-6 space-y-4">
            <div
              v-for="booking in selectedDayBookings"
              :key="booking.id"
              class="border border-[#e8e0d4] rounded-xl p-4 hover:bg-[#faf8f5] transition"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <p class="font-semibold text-[#3d2b1f]">{{ booking.customer_name }}</p>
                  <p class="text-sm text-[#7a6a5a]">{{ booking.customer_phone }}</p>
                </div>
                <span class="text-xs px-3 py-1 rounded-full font-medium" :class="statusColor(booking.status)">
                  {{ statusText(booking.status) }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-[#7a6a5a]">
                <span class="text-base">🕐</span>
                <span>{{ booking.time }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>