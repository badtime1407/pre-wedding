<script setup>
import { ref, computed } from "vue"
import { onMounted } from "vue"

onMounted(async () => {
  try {
    const res = await fetch("http://localhost:8787/bookings/occupied")
    const data = await res.json()
    occupiedSlots.value = data
  } catch (err) {
    console.log("โหลดข้อมูล slot ล้มเหลว")
  }
})

/* =====================
   DATE SETUP
===================== */
const today = new Date()

const month = ref(today.getMonth())
const year = ref(today.getFullYear())

const selectedDate = ref(null)
const selectedTime = ref(null)

/* =====================
   TIME OPTIONS
===================== */
const times = [
  "09:30 น. - 11:00 น.",
  "11:30 น. - 13:00 น.",
  "14:00 น. - 15:30 น.",
  "16:00 น. - 17:30 น.",
]

/* =====================
   MODALS
===================== */
const showCustomerForm = ref(false)
const showSuccess = ref(false)

/* =====================
   CUSTOMER INFO
===================== */
const customerName = ref("")
const customerPhone = ref("")

/* =====================
   CALENDAR LOGIC
===================== */
const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

const firstDay = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else month.value--
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else month.value++
}

function selectDate(day) {
  selectedDate.value = `${year.value}-${String(
    month.value + 1
  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/* =====================
   SUBMIT FLOW
===================== */
function submitBooking() {
  if (!selectedDate.value || !selectedTime.value) {
    alert("กรุณาเลือกวันและเวลา")
    return
  }

  showCustomerForm.value = true
}

async function confirmCustomerInfo() {
  if (!customerName.value || !customerPhone.value) {
    alert("กรุณากรอกชื่อและเบอร์โทร")
    return
  }

  const token = localStorage.getItem("token")

  if (!token) {
    alert("กรุณาเข้าสู่ระบบก่อนทำการจอง")
    return
  }

  try {
    const res = await fetch("http://localhost:8787/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        date: selectedDate.value,
        time: selectedTime.value,
        customer_name: customerName.value,
        customer_phone: customerPhone.value,
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message)
      return
    }

    showCustomerForm.value = false
    showSuccess.value = true

  } catch (err) {
    alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้")
  }
}

const occupiedSlots = ref([])

function closeModal() {
  showSuccess.value = false
  selectedDate.value = null
  selectedTime.value = null
  customerName.value = ""
  customerPhone.value = ""
}

function fullDate(day) {
  return `${year.value}-${String(month.value + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function isTimeBooked(date, time) {
  return occupiedSlots.value.some(
    b => b.date === date && b.time === time
  )
}

function isDateFullyBooked(date) {
  const dayBookings = occupiedSlots.value.filter(
    b => b.date === date
  )
  return dayBookings.length >= times.length
}
</script>

<template>
  <div class="bg-white min-h-screen p-10">

    <h1 class="text-center text-3xl font-bold mb-12">
      นัดหมายปรึกษา
    </h1>

    <div class="max-w-5xl mx-auto flex justify-center gap-16">

      <!-- ================= CALENDAR ================= -->
      <div class="bg-white rounded-xl border shadow-md p-6 w-80">

        <p class="mb-3 font-medium">เลือกวันที่</p>

        <div class="flex justify-between items-center mb-4">
          <button @click="prevMonth" class="text-xl font-bold hover:text-gray-600">
            ‹
          </button>

          <span class="font-semibold text-lg">
            {{ month + 1 }}/{{ year }}
          </span>

          <button @click="nextMonth" class="text-xl font-bold hover:text-gray-600">
            ›
          </button>
        </div>

        <div class="grid grid-cols-7 text-center text-sm mb-2 text-gray-500">
          <div v-for="d in ['อา','จ','อ','พ','พฤ','ศ','ส']" :key="d">
            {{ d }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-2">
          <div v-for="i in firstDay" :key="'e'+i"></div>

          <button
  v-for="day in daysInMonth"
  :key="day"
  :disabled="isDateFullyBooked(fullDate(day))"
  @click="!isDateFullyBooked(fullDate(day)) && selectDate(day)"
  class="h-9 rounded-full text-sm transition"
  :class="{
    'bg-black text-white':
      selectedDate?.endsWith('-' + String(day).padStart(2,'0')),
    'bg-gray-200 text-gray-400 cursor-not-allowed':
      isDateFullyBooked(fullDate(day))
  }"
>
  {{ day }}
</button>
        </div>
      </div>

      <!-- ================= TIME ================= -->
      <div class="w-72">
        <p class="mb-4 font-medium">เลือกเวลา</p>

        <div class="space-y-4">
          <button
  v-for="time in times"
  :key="time"
  :disabled="isTimeBooked(selectedDate, time)"
  @click="!isTimeBooked(selectedDate, time) && (selectedTime = time)"
  class="w-full py-3 rounded-xl border transition"
  :class="{
    'border-black font-semibold bg-gray-50':
      selectedTime === time,
    'bg-gray-200 text-gray-400 cursor-not-allowed':
      isTimeBooked(selectedDate, time)
  }"
>
  {{ time }}
</button>
        </div>

        <button
          @click="submitBooking"
          class="w-full mt-8 py-3 rounded-xl bg-[#e7dcc7] font-medium hover:opacity-80 transition"
        >
          ยืนยัน
        </button>
      </div>
    </div>

    <!-- ================= CUSTOMER MODAL ================= -->
    <div
      v-if="showCustomerForm"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-xl p-8 w-96 animate-fade">

        <h2 class="text-lg font-semibold mb-6 text-center">
          กรอกข้อมูลติดต่อ
        </h2>

        <div class="space-y-4">
          <input
            v-model="customerName"
            type="text"
            placeholder="ชื่อ-นามสกุล"
            class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />

          <input
            v-model="customerPhone"
            type="tel"
            placeholder="เบอร์โทรศัพท์"
            class="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showCustomerForm = false"
            class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            ยกเลิก
          </button>

          <button
            @click="confirmCustomerInfo"
            class="px-4 py-2 rounded-lg bg-[#e7dcc7] hover:opacity-80 transition"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>

    <!-- ================= SUCCESS MODAL ================= -->
    <div
      v-if="showSuccess"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-xl px-10 py-8 text-center w-80 animate-fade">

        <div class="mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-full bg-green-500 text-white text-2xl">
          ✓
        </div>

        <p class="font-medium text-lg mb-6">
          ยืนยันการนัดหมายเสร็จสิ้น
        </p>

        <button
          @click="closeModal"
          class="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
          ปิด
        </button>
      </div>
    </div>

  </div>
</template>

<style>
@keyframes fade {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade {
  animation: fade 0.25s ease-out;
}
</style>
