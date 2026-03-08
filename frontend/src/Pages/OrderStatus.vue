<script setup>
import { ref, onMounted } from "vue"

const bookings = ref([])
const loading  = ref(true)
const error    = ref("")
const selected = ref(null)

onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error()
    bookings.value = await res.json()
  } catch {
    error.value = "ไม่สามารถโหลดข้อมูลได้"
  } finally {
    loading.value = false
  }
})

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม",   "เมษายน",
  "พฤษภาคม", "มิถุนายน",  "กรกฎาคม",  "สิงหาคม",
  "กันยายน", "ตุลาคม",    "พฤศจิกายน", "ธันวาคม",
]

const thaiShort = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.",  "ต.ค.",  "พ.ย.", "ธ.ค.",
]

function formatDate(d) {
  if (!d) return ""
  const [y, m, dd] = d.split("-")
  return `${parseInt(dd)} ${thaiMonths[parseInt(m) - 1]} ${parseInt(y) + 543}`
}

function dayNum(d) {
  return d?.split("-")[2] ?? ""
}

function monthShort(d) {
  return thaiShort[parseInt(d?.split("-")[1]) - 1] ?? ""
}

function statusLabel(s) {
  return {
    pending:     "รอดำเนินการ",
    in_progress: "กำลังดำเนินการ",
    completed:   "เสร็จสิ้น",
    confirmed:   "ยืนยันแล้ว",
    cancelled:   "ยกเลิก",
  }[s] ?? s
}

function statusClass(s) {
  return {
    pending:     "bg-amber-50 text-amber-700 border border-amber-200",
    in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
    completed:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
    confirmed:   "bg-green-50 text-green-700 border border-green-200",
    cancelled:   "bg-red-50 text-red-700 border border-red-200",
  }[s]
}

</script>

<template>
  <div class="min-h-screen bg-[#f5f1ec] py-12 px-4 font-[Sarabun,sans-serif]">

    <!-- HEADER -->
    <h1 class="text-center text-3xl font-bold text-[#2c2218] mb-1">
      สถานะการจัดงานของฉัน
    </h1>
    <p class="text-center text-sm text-[#9e8e80] mb-10">
      ตรวจสอบรายละเอียดการจองของคุณ
    </p>

    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-8 h-8 border-4 border-[#e7dcc7] border-t-[#9c7f5e] rounded-full animate-spin"/>
    </div>

    <!-- ERROR -->
    <p v-else-if="error" class="text-center text-red-500 py-12">
      {{ error }}
    </p>

    <!-- EMPTY -->
    <div v-else-if="bookings.length === 0" class="text-center py-20 text-[#a89880]">
      <div class="text-5xl mb-3">📋</div>
      <p class="text-base font-medium">ยังไม่มีการจอง</p>
    </div>

    <!-- LIST -->
    <div v-else class="max-w-2xl mx-auto space-y-3">
      <div
        v-for="b in bookings"
        :key="b.id"
        @click="selected = b"
        class="bg-white rounded-2xl border border-[#ede8e2] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        <div class="flex items-center justify-between px-5 py-4 gap-4">

          <!-- DATE BADGE + INFO -->
          <div class="flex items-center gap-4">
            <div class="w-12 bg-[#e7dcc7] rounded-xl flex flex-col items-center justify-center py-2">
              <span class="text-2xl font-bold text-[#3d2f22]">{{ dayNum(b.date) }}</span>
              <span class="text-[10px] font-semibold text-[#7a6552] uppercase">{{ monthShort(b.date) }}</span>
            </div>

            <div>
              <p class="font-semibold text-[#2c2218] text-base">{{ b.customer_name }}</p>
              <p class="text-xs text-[#6b5c4e] mt-0.5">🕐 {{ b.time }}</p>
              <p class="text-xs text-[#9e8e80]">{{ formatDate(b.date) }}</p>
            </div>
          </div>

          <!-- STATUS -->
          <div class="flex items-center gap-3">
            <span class="text-xs font-semibold px-3 py-1 rounded-full" :class="statusClass(b.status)">
              {{ statusLabel(b.status) }}
            </span>
            <span class="text-[#c5b9ac] text-xl">›</span>
          </div>

        </div>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="selected"
        class="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4"
        @click.self="selected = null"
      >
        <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

          <!-- MODAL HEADER -->
          <div class="flex justify-between items-start px-6 pt-6 pb-4 border-b border-[#ede8e2] gap-4">
            <div>
              <h2 class="text-lg font-bold text-[#2c2218]">{{ selected.customer_name }}</h2>
              <p class="text-xs text-[#9e8e80]">{{ formatDate(selected.date) }}</p>
            </div>
            <button
              @click="selected = null"
              class="w-8 h-8 rounded-full bg-[#f0ece7] hover:bg-[#e3dcd4] transition"
            >✕</button>
          </div>

          <!-- MODAL BODY -->
          <div class="px-6 py-5">
            <div class="grid grid-cols-2 gap-3 bg-[#faf7f3] rounded-xl p-4">

              <div>
                <span class="text-xs text-[#a08c7a]">ชื่อผู้ติดต่อ</span>
                <p class="text-sm font-semibold">{{ selected.customer_name }}</p>
              </div>

              <div>
                <span class="text-xs text-[#a08c7a]">เบอร์โทร</span>
                <p class="text-sm font-semibold">{{ selected.customer_phone }}</p>
              </div>

              <div>
                <span class="text-xs text-[#a08c7a]">วันที่</span>
                <p class="text-sm font-semibold">{{ formatDate(selected.date) }}</p>
              </div>

              <div>
                <span class="text-xs text-[#a08c7a]">เวลา</span>
                <p class="text-sm font-semibold">{{ selected.time }}</p>
              </div>

              <div v-if="selected.package_name">
                <span class="text-xs text-[#a08c7a]">แพ็คเกจ</span>
                <p class="text-sm font-semibold">{{ selected.package_name }}</p>
              </div>

              <div v-if="selected.package_price">
                <span class="text-xs text-[#a08c7a]">ราคา</span>
                <p class="text-sm font-semibold">฿{{ selected.package_price.toLocaleString() }}</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>