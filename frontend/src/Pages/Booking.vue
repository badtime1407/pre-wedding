<script setup>
import { ref, computed } from "vue"

const today = new Date()

const month = ref(today.getMonth())
const year = ref(today.getFullYear())

const selectedDate = ref(null)
const selectedTime = ref(null)

const times = [
  "09:30 น. - 11:00 น.",
  "11:30 น. - 13:00 น.",
  "14:00 น. - 15:30 น.",
  "16:00 น. - 17:30 น.",
]

// วันในเดือน
const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

// วันแรก
const firstDay = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

// เปลี่ยนเดือน
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

// เลือกวัน
function selectDate(day) {
  selectedDate.value = `${year.value}-${String(
    month.value + 1
  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

// ส่ง
function submitBooking() {
  if (!selectedDate.value || !selectedTime.value) {
    alert("กรุณาเลือกวันและเวลา")
    return
  }

  console.log({
    date: selectedDate.value,
    time: selectedTime.value,
  })

  alert("บันทึกแล้ว ✅")
}
</script>

<template>
  <div class="bg-white p-10">

    <!-- หัวข้อ -->
    <h1 class="text-center text-2xl font-bold mb-12">
      นัดหมายปรึกษา
    </h1>

    <div class="max-w-5xl mx-auto flex justify-center gap-16">

      <!-- ปฏิทิน -->
      <div
        class="bg-white rounded-xl border shadow-md p-6 w-80"
      >

        <p class="mb-3 font-medium">
          เลือกวันที่
        </p>

        <!-- Header -->
        <div class="flex justify-between items-center mb-4">

          <button
            @click="prevMonth"
            class="text-xl font-bold"
          >
            ‹
          </button>

          <span class="font-semibold text-lg">
            {{ month + 1 }}/{{ year }}
          </span>

          <button
            @click="nextMonth"
            class="text-xl font-bold"
          >
            ›
          </button>

        </div>

        <!-- วัน -->
        <div
          class="grid grid-cols-7 text-center text-sm mb-2 text-gray-500"
        >
          <div
            v-for="d in ['จ','อ','พ','พฤ','ศ','ส','อา']"
            :key="d"
          >
            {{ d }}
          </div>
        </div>

        <!-- วันที่ -->
        <div class="grid grid-cols-7 gap-2">

          <div
            v-for="i in firstDay"
            :key="'e'+i"
          ></div>

          <button
            v-for="day in daysInMonth"
            :key="day"
            @click="selectDate(day)"
            class="h-8 rounded-full text-sm hover:bg-gray-200"
            :class="{
              'bg-black text-white':
                selectedDate?.endsWith('-' + String(day).padStart(2,'0'))
            }"
          >
            {{ day }}
          </button>

        </div>

      </div>

      <!-- เวลา -->
      <div class="w-72">

        <p class="mb-4 font-medium">
          เลือกเวลา
        </p>

        <div class="space-y-4">

          <button
            v-for="time in times"
            :key="time"
            @click="selectedTime = time"
            class="w-full py-3 rounded-xl bg-white border shadow-sm hover:shadow-md"
            :class="{
              'border-black font-semibold':
                selectedTime === time
            }"
          >
            {{ time }}
          </button>

        </div>

        <!-- ปุ่มยืนยัน -->
        <button
          @click="submitBooking"
          class="w-full mt-8 py-3 rounded-xl bg-[#e7dcc7] font-medium hover:opacity-80"
        >
          ยืนยัน
        </button>

      </div>

    </div>

  </div>
</template>
