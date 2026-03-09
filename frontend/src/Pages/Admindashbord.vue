<script setup>
import { ref, computed, onMounted } from "vue"

const bookings  = ref([])
const packages  = ref([])
const loading   = ref(true)

const filterYear  = ref(new Date().getFullYear())
const filterMonth = ref(0)

const years  = [2024, 2025, 2026, 2027]
const months = [
  { v: 0,  l: "ทั้งหมด" },
  { v: 1,  l: "มกราคม" }, { v: 2,  l: "กุมภาพันธ์" }, { v: 3,  l: "มีนาคม" },
  { v: 4,  l: "เมษายน" }, { v: 5,  l: "พฤษภาคม" },   { v: 6,  l: "มิถุนายน" },
  { v: 7,  l: "กรกฎาคม" },{ v: 8,  l: "สิงหาคม" },   { v: 9,  l: "กันยายน" },
  { v: 10, l: "ตุลาคม" }, { v: 11, l: "พฤศจิกายน" },  { v: 12, l: "ธันวาคม" },
]

onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    const headers = { Authorization: `Bearer ${token}` }
    const [bRes, pRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/bookings`, { headers }),
      fetch(`${import.meta.env.VITE_API_URL}/packages`, { headers }),
    ])
    bookings.value = await bRes.json()
    packages.value = await pRes.json()
  } finally {
    loading.value = false
  }
})

/* ── filtered bookings ── */
const filtered = computed(() => {
  return bookings.value.filter(b => {
    if (!b.date) return false
    const [y, m] = b.date.split("-").map(Number)
    if (y !== filterYear.value) return false
    if (filterMonth.value !== 0 && m !== filterMonth.value) return false
    return true
  })
})

/* ── stats ── */
const totalRevenue = computed(() =>
  filtered.value
    .filter(b => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.package_price ?? 0), 0)
)

const paidRevenue = computed(() =>
  filtered.value
    .filter(b => b.payment_status === "paid" && b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.package_price ?? 0), 0)
)

const depositRevenue = computed(() =>
  filtered.value
    .filter(b => b.payment_status === "deposit" && b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.package_price ?? 0), 0)
)

const unpaidRevenue = computed(() =>
  filtered.value
    .filter(b => (b.payment_status === "unpaid" || !b.payment_status) && b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.package_price ?? 0), 0)
)

const totalBookings = computed(() => filtered.value.length)

const statusCounts = computed(() => ({
  pending:     filtered.value.filter(b => b.status === "pending").length,
  in_progress: filtered.value.filter(b => b.status === "in_progress").length,
  completed:   filtered.value.filter(b => b.status === "completed").length,
  cancelled:   filtered.value.filter(b => b.status === "cancelled").length,
}))

const paymentCounts = computed(() => ({
  paid:    filtered.value.filter(b => b.payment_status === "paid"    && b.status !== "cancelled").length,
  deposit: filtered.value.filter(b => b.payment_status === "deposit" && b.status !== "cancelled").length,
  unpaid:  filtered.value.filter(b => (b.payment_status === "unpaid" || !b.payment_status) && b.status !== "cancelled").length,
}))

/* ── top package ── */
const topPackage = computed(() => {
  const count = {}
  filtered.value.forEach(b => {
    if (b.package_name) count[b.package_name] = (count[b.package_name] ?? 0) + 1
  })
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0]
  return top ? { name: top[0], count: top[1] } : null
})

/* ── package breakdown ── */
const packageBreakdown = computed(() => {
  const count = {}
  filtered.value.forEach(b => {
    if (b.package_name) count[b.package_name] = (count[b.package_name] ?? 0) + 1
  })
  const total = Object.values(count).reduce((s, v) => s + v, 0) || 1
  const colors = ["#9c7f5e","#c4a882","#e7dcc7","#3d2f22","#d4b896","#7a6a5a"]
  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([name, c], i) => ({
      name, count: c,
      pct: Math.round((c / total) * 100),
      color: colors[i % colors.length],
    }))
})

/* ── donut chart ── */
const donutSegments = computed(() => {
  let offset = 0
  const r = 54, circ = 2 * Math.PI * r
  return packageBreakdown.value.map(p => {
    const dash = (p.pct / 100) * circ
    const seg = { dash, gap: circ - dash, offset, color: p.color }
    offset += dash
    return seg
  })
})

/* ── monthly chart ── */
const monthlyData = computed(() => {
  const arr = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0, revenue: 0 }))
  bookings.value.forEach(b => {
    if (!b.date) return
    const [y, m] = b.date.split("-").map(Number)
    if (y !== filterYear.value) return
    if (b.status === "cancelled") return
    arr[m - 1].count++
    arr[m - 1].revenue += b.package_price ?? 0
  })
  return arr
})

const maxCount = computed(() => Math.max(...monthlyData.value.map(d => d.count), 1))
const thaiMonthShort = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]

/* ── recent bookings table ── */
const searchQ   = ref("")
const tablePage = ref(1)
const perPage   = 10

const recentFiltered = computed(() => {
  let list = [...filtered.value].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  if (searchQ.value.trim()) {
    const q = searchQ.value.toLowerCase()
    list = list.filter(b =>
      b.customer_name?.toLowerCase().includes(q) ||
      b.package_name?.toLowerCase().includes(q)
    )
  }
  return list
})

const totalTablePages = computed(() => Math.max(1, Math.ceil(recentFiltered.value.length / perPage)))
const tableRows = computed(() => {
  const s = (tablePage.value - 1) * perPage
  return recentFiltered.value.slice(s, s + perPage)
})

function formatDate(d) {
  if (!d) return "-"
  const [y, m, dd] = d.split("-")
  return `${parseInt(dd)} ${thaiMonthShort[parseInt(m)-1]} ${parseInt(y)+543}`
}
function formatMoney(n) { return Number(n ?? 0).toLocaleString() }

const statusLabel = s => ({ pending:"รอดำเนินการ", in_progress:"กำลังดำเนินการ", completed:"เสร็จสิ้น", cancelled:"ยกเลิก" }[s] ?? s)
const statusClass = s => ({
  pending:     "bg-amber-50 text-amber-700 border border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
  completed:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
  cancelled:   "bg-red-50 text-red-700 border border-red-200",
}[s] ?? "")

const paymentLabel = s => ({ unpaid:"ยังไม่ชำระ", deposit:"ชำระมัดจำ", paid:"ชำระแล้ว" }[s] ?? "ยังไม่ชำระ")
const paymentClass = s => ({
  unpaid:  "bg-gray-50 text-gray-500 border border-gray-200",
  deposit: "bg-orange-50 text-orange-600 border border-orange-200",
  paid:    "bg-emerald-50 text-emerald-700 border border-emerald-200",
}[s] ?? "bg-gray-50 text-gray-500 border border-gray-200")
</script>

<template>
<div class="min-h-screen bg-[#f6eee1] flex">
  <sidebar />
  <div class="flex-1 p-6 overflow-auto">

    <!-- HEADER -->
    <div class="mb-6">
      <p class="text-xs text-[#9e8e80] mb-1">หน้าหลัก › รายงานรายได้และสถิติการจอง</p>
      <h1 class="text-2xl font-bold text-[#2c2218]">สถิติรายได้และประสิทธิภาพ</h1>
      <p class="text-sm text-[#9e8e80] mt-0.5">สรุปภาพรวมรายรับและการจองสำหรับทีมของคุณ</p>
    </div>

    <!-- FILTERS -->
    <div class="flex flex-wrap gap-3 items-center mb-6">
      <select v-model="filterYear"
        class="border border-[#ddd5c8] rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30">
        <option v-for="y in years" :key="y" :value="y">{{ y + 543 }}</option>
      </select>
      <select v-model="filterMonth"
        class="border border-[#ddd5c8] rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30">
        <option v-for="m in months" :key="m.v" :value="m.v">{{ m.l }}</option>
      </select>
      <button @click="filterMonth = 0; filterYear = new Date().getFullYear()"
        class="px-4 py-2 rounded-xl border border-[#ddd5c8] text-sm bg-white text-[#7a6a5a] hover:bg-[#f0ece7] transition">
        รีเซ็ต
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-4 border-[#e7dcc7] border-t-[#9c7f5e] rounded-full animate-spin"/>
    </div>

    <template v-else>

      <!-- STAT CARDS ROW 1 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        <!-- รายได้รวม -->
        <div class="bg-white rounded-2xl border border-[#ede8e2] p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">💰</div>
            <p class="text-sm text-[#9e8e80]">รายได้รวมทั้งหมด</p>
          </div>
          <p class="text-3xl font-bold text-[#2c2218]">฿ {{ formatMoney(totalRevenue) }}</p>
          <p class="text-xs text-[#9e8e80] mt-1">จากการจองที่ไม่ถูกยกเลิก</p>
        </div>

        <!-- จำนวนจอง -->
        <div class="bg-white rounded-2xl border border-[#ede8e2] p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">📅</div>
            <p class="text-sm text-[#9e8e80]">จำนวนการจอง</p>
          </div>
          <p class="text-3xl font-bold text-[#2c2218]">{{ totalBookings }} <span class="text-base font-normal text-[#9e8e80]">รายการ</span></p>
          <div class="flex gap-3 mt-2 flex-wrap">
            <span class="text-xs text-amber-600">รอ {{ statusCounts.pending }}</span>
            <span class="text-xs text-blue-600">ดำเนิน {{ statusCounts.in_progress }}</span>
            <span class="text-xs text-emerald-600">เสร็จ {{ statusCounts.completed }}</span>
            <span class="text-xs text-red-500">ยกเลิก {{ statusCounts.cancelled }}</span>
          </div>
        </div>

        <!-- แพ็คเกจยอดนิยม -->
        <div class="bg-white rounded-2xl border border-[#ede8e2] p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-[#f0ece7] flex items-center justify-center text-xl">⭐</div>
            <p class="text-sm text-[#9e8e80]">แพ็คเกจยอดนิยม</p>
          </div>
          <p v-if="topPackage" class="text-xl font-bold text-[#2c2218] leading-tight">{{ topPackage.name }}</p>
          <p v-else class="text-sm text-[#9e8e80]">ยังไม่มีข้อมูล</p>
          <p v-if="topPackage" class="text-xs text-[#9e8e80] mt-1">{{ topPackage.count }} การจอง ({{ Math.round(topPackage.count / totalBookings * 100) || 0 }}% ของทั้งหมด)</p>
        </div>

      </div>

      <!-- STAT CARDS ROW 2 — ยอดชำระ -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <!-- ชำระแล้ว -->
        <div class="bg-white rounded-2xl border border-emerald-100 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">✅</div>
            <div>
              <p class="text-sm text-[#9e8e80]">ชำระแล้ว</p>
              <span class="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{{ paymentCounts.paid }} รายการ</span>
            </div>
          </div>
          <p class="text-2xl font-bold text-emerald-600">฿ {{ formatMoney(paidRevenue) }}</p>
        </div>

        <!-- มัดจำแล้ว -->
        <div class="bg-white rounded-2xl border border-orange-100 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">🔖</div>
            <div>
              <p class="text-sm text-[#9e8e80]">ชำระมัดจำ</p>
              <span class="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full">{{ paymentCounts.deposit }} รายการ</span>
            </div>
          </div>
          <p class="text-2xl font-bold text-orange-500">฿ {{ formatMoney(depositRevenue) }}</p>
        </div>

        <!-- ยังไม่ชำระ -->
        <div class="bg-white rounded-2xl border border-[#ede8e2] p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">⏳</div>
            <div>
              <p class="text-sm text-[#9e8e80]">ยังไม่ชำระ</p>
              <span class="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">{{ paymentCounts.unpaid }} รายการ</span>
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-500">฿ {{ formatMoney(unpaidRevenue) }}</p>
        </div>

      </div>

      <!-- CHARTS ROW -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        <!-- BAR CHART -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-[#ede8e2] p-5">
          <div class="flex items-center justify-between mb-4">
            <p class="font-semibold text-[#2c2218]">รายได้รายเดือน ({{ filterYear + 543 }})</p>
            <span class="text-xs text-[#9e8e80] flex items-center gap-1">
              <span class="w-3 h-3 rounded-full bg-[#9c7f5e] inline-block"></span> จำนวนการจอง
            </span>
          </div>
          <div class="flex items-end gap-1.5 h-40">
            <div v-for="(d, i) in monthlyData" :key="i" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full rounded-t-md relative overflow-hidden transition-all duration-500"
                :style="`height: ${maxCount > 0 ? (d.count / maxCount) * 128 : 0}px; min-height: ${d.count > 0 ? 4 : 0}px; background:#9c7f5e`"/>
              <span class="text-[10px] text-[#9e8e80]">{{ thaiMonthShort[i] }}</span>
            </div>
          </div>
        </div>

        <!-- DONUT CHART -->
        <div class="bg-white rounded-2xl border border-[#ede8e2] p-5">
          <p class="font-semibold text-[#2c2218] mb-4">สรุปยอดตามแพ็คเกจ</p>
          <div v-if="packageBreakdown.length === 0" class="flex items-center justify-center h-32 text-[#a89880] text-sm">ไม่มีข้อมูล</div>
          <div v-else class="flex flex-col items-center">
            <div class="relative w-32 h-32 mb-4">
              <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#f0ece7" stroke-width="12"/>
                <circle v-for="(seg, i) in donutSegments" :key="i"
                  cx="60" cy="60" r="54" fill="none"
                  :stroke="seg.color" stroke-width="12"
                  :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                  :stroke-dashoffset="-seg.offset"
                  stroke-linecap="butt"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <p class="text-2xl font-bold text-[#2c2218]">{{ totalBookings }}</p>
                <p class="text-xs text-[#9e8e80]">การจอง</p>
              </div>
            </div>
            <div class="w-full space-y-2">
              <div v-for="p in packageBreakdown" :key="p.name" class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="`background:${p.color}`"/>
                  <span class="text-[#5a4a3a] truncate max-w-[120px]">{{ p.name }}</span>
                </div>
                <span class="font-semibold text-[#2c2218]">{{ p.pct }}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- TABLE -->
      <div class="bg-white rounded-2xl border border-[#ede8e2] overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[#f0ece7]">
          <p class="font-semibold text-[#2c2218]">รายละเอียดรายได้รายวัน</p>
          <input v-model="searchQ" type="text" placeholder="ค้นหาชื่อลูกค้า..."
            class="border border-[#ddd5c8] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30 w-48"/>
        </div>
        <table class="w-full">
          <thead class="bg-[#faf7f3]">
            <tr>
              <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">วันที่</th>
              <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">ลูกค้า</th>
              <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">แพ็คเกจ</th>
              <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">สถานะ</th>
              <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">ชำระเงิน</th>
              <th class="px-5 py-3 text-right text-xs text-[#9e8e80] font-medium">จำนวนเงินสุทธิ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in tableRows" :key="b.id" class="border-b border-[#f0ece7] hover:bg-[#faf7f3] transition">
              <td class="px-5 py-3 text-sm text-[#2c2218]">{{ formatDate(b.date) }}</td>
              <td class="px-5 py-3 text-sm text-[#2c2218]">{{ b.customer_name }}</td>
              <td class="px-5 py-3">
                <span v-if="b.package_name" class="text-xs bg-[#e7dcc7] text-[#3d2f22] px-2 py-1 rounded-full">{{ b.package_name }}</span>
                <span v-else class="text-xs text-[#c5b9ac]">-</span>
              </td>
              <td class="px-5 py-3">
                <span class="text-xs px-2 py-1 rounded-full" :class="statusClass(b.status)">{{ statusLabel(b.status) }}</span>
              </td>
              <td class="px-5 py-3">
                <span class="text-xs px-2 py-1 rounded-full" :class="paymentClass(b.payment_status || 'unpaid')">{{ paymentLabel(b.payment_status || 'unpaid') }}</span>
              </td>
              <td class="px-5 py-3 text-right text-sm font-semibold"
                :class="b.status === 'cancelled' ? 'text-[#c5b9ac]' : 'text-[#2c2218]'">
                {{ b.status === 'cancelled' ? '-' : `฿ ${formatMoney(b.package_price)}` }}
              </td>
            </tr>
            <tr v-if="tableRows.length === 0">
              <td colspan="6" class="text-center py-10 text-[#a89880] text-sm">ไม่พบข้อมูล</td>
            </tr>
          </tbody>
        </table>
        <div class="flex items-center justify-between px-5 py-3 border-t border-[#f0ece7]">
          <p class="text-xs text-[#9e8e80]">แสดง 1 ถึง {{ Math.min(tablePage * perPage, recentFiltered.length) }} จาก {{ recentFiltered.length }} รายการ</p>
          <div class="flex gap-1">
            <button @click="tablePage--" :disabled="tablePage === 1"
              class="w-7 h-7 rounded-lg border text-xs disabled:opacity-30 hover:bg-[#f0ece7] transition">‹</button>
            <button v-for="p in totalTablePages" :key="p" @click="tablePage = p"
              class="w-7 h-7 rounded-lg border text-xs transition"
              :class="tablePage === p ? 'bg-[#3d2f22] text-white border-transparent' : 'hover:bg-[#f0ece7]'">
              {{ p }}
            </button>
            <button @click="tablePage++" :disabled="tablePage === totalTablePages"
              class="w-7 h-7 rounded-lg border text-xs disabled:opacity-30 hover:bg-[#f0ece7] transition">›</button>
          </div>
        </div>
      </div>

    </template>
  </div>
</div>
</template>