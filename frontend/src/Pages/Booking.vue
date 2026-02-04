<script setup>
import { ref, computed } from "vue"

// วันที่วันนี้
const today = new Date()

const month = ref(today.getMonth())
const year = ref(today.getFullYear())

const selectedDate = ref(null)
const selectedTime = ref(null)

// เวลาที่เปิดจอง
const times = [
  "09:30-11:00",
  "11:30-13:00",
  "14:00-15:30",
  "16:00-17:30",
]

// จำนวนวันในเดือน
const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

// วันแรกของเดือน
const firstDay = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

// เปลี่ยนเดือน
function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
}

// เลือกวัน
function selectDate(day) {
  selectedDate.value = `${year.value}-${String(
    month.value + 1
  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

// ส่งข้อมูล (ตอนนี้ยังแค่ log)
async function submitBooking() {
  if (!selectedDate.value || !selectedTime.value) {
    alert("กรุณาเลือกวันและเวลา")
    return
  }

  const bookingData = {
    date: selectedDate.value,
    time: selectedTime.value,
  }

  console.log("ข้อมูลที่ส่งไป Backend:", bookingData)

  // 🔴 ตอนหลังแค่เอา comment ออก
  /*
  await fetch("http://localhost:8787/booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  })
  */

  alert("เตรียมส่งข้อมูลเรียบร้อย ✅")
}
</script>

<template>
  <div class="max-w-5xl mx-auto py-12">

    <h1 class="text-2xl font-bold text-center mb-10">
      นัดหมายปรึกษา
    </h1>

    <div class="flex justify-center gap-12">

      <!-- ปฏิทิน -->
      <div class="bg-white shadow rounded-xl p-4 w-72">

        <!-- Header -->
        <div class="flex justify-between items-center mb-3">

          <button @click="prevMonth">◀</button>

          <div class="font-bold">
            {{ month + 1 }}/{{ year }}
          </div>

          <button @click="nextMonth">▶</button>

        </div>

        <!-- ชื่อวัน -->
        <div class="grid grid-cols-7 text-center text-sm mb-2">
          <div v-for="d in ['อา','จ','อ','พ','พฤ','ศ','ส']" :key="d">
            {{ d }}
          </div>
        </div>

        <!-- วันที่ -->
        <div class="grid grid-cols-7 gap-1 text-center">

          <div
            v-for="n in firstDay"
            :key="'e'+n"
          ></div>

          <button
            v-for="day in daysInMonth"
            :key="day"
            @click="selectDate(day)"
            class="py-1 rounded hover:bg-blue-100"
            :class="{
              'bg-blue-500 text-white':
                selectedDate?.endsWith('-' + String(day).padStart(2,'0'))
            }"
          >
            {{ day }}
          </button>

        </div>

      </div>

      <!-- เวลา -->
      <div class="w-64">

        <h3 class="font-bold mb-4 text-center">
          เลือกเวลา
        </h3>

        <div class="space-y-3">

          <button
            v-for="time in times"
            :key="time"
            @click="selectedTime = time"
            class="w-full border py-2 rounded-lg"
            :class="{
              'bg-blue-500 text-white': selectedTime === time
            }"
          >
            {{ time }}
          </button>

        </div>

        <button
          @click="submitBooking"
          class="w-full mt-6 bg-green-500 text-white py-2 rounded-lg"
        >
          ยืนยัน
        </button>

      </div>

    </div>

  </div>
</template>