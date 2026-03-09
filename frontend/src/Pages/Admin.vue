<script setup>
import { ref, computed, onMounted } from "vue"

const bookings = ref([])
const packages = ref([])
const loading  = ref(true)
const error    = ref("")

const filterStatus = ref("all")
const searchQuery  = ref("")
const filterFrom   = ref("")
const filterTo     = ref("")
const currentPage  = ref(1)
const perPage      = 10

const showDetail     = ref(false)
const showAssign     = ref(false)
const showConfirm    = ref(false)
const showReschedule = ref(false)

const selectedBooking = ref(null)
const confirmAction   = ref(null)

const assignPkgId = ref(null)
const assignNote  = ref("")

const rescheduleDate  = ref("")
const rescheduleTime  = ref("")
const rescheduleError = ref("")

const toast = ref({ show: false, msg: "", type: "success" })
function showToast(msg, type = "success") {
  toast.value = { show: true, msg, type }
  setTimeout(() => (toast.value.show = false), 3000)
}

onMounted(async () => {
  await Promise.all([loadBookings(), loadPackages()])
})

async function loadBookings() {
  loading.value = true
  try {
    const token = localStorage.getItem("token")
    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error()
    bookings.value = await res.json()
  } catch {
    error.value = "โหลดข้อมูลไม่สำเร็จ"
  } finally {
    loading.value = false
  }
}

async function loadPackages() {
  const token = localStorage.getItem("token")
  const res = await fetch(`${import.meta.env.VITE_API_URL}/packages`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) packages.value = await res.json()
}

const counts = computed(() => ({
  all:         bookings.value.length,
  pending:     bookings.value.filter((b) => b.status === "pending").length,
  in_progress: bookings.value.filter((b) => b.status === "in_progress").length,
  completed:   bookings.value.filter((b) => b.status === "completed").length,
  cancelled:   bookings.value.filter((b) => b.status === "cancelled").length,
}))

const filtered = computed(() => {
  let list = [...bookings.value]
  if (filterStatus.value !== "all")
    list = list.filter((b) => b.status === filterStatus.value)
  if (filterFrom.value) list = list.filter((b) => b.date >= filterFrom.value)
  if (filterTo.value)   list = list.filter((b) => b.date <= filterTo.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((b) =>
      b.customer_name?.toLowerCase().includes(q) || b.customer_phone?.includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated  = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

function setFilter(s) { filterStatus.value = s; currentPage.value = 1 }

function openDetail(b)          { selectedBooking.value = b; showDetail.value = true }
function openConfirm(type, b)   { confirmAction.value = { type, booking: b }; showConfirm.value = true }
function openAssign(b)          { selectedBooking.value = b; assignPkgId.value = b.package_id ?? null; assignNote.value = b.note ?? ""; showAssign.value = true }
function openReschedule(b)      { selectedBooking.value = b; rescheduleDate.value = b.date ?? ""; rescheduleTime.value = b.time ?? ""; rescheduleError.value = ""; showReschedule.value = true }

async function updateStatus(booking, newStatus) {
  const token = localStorage.getItem("token")
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { showToast(data.message || `ผิดพลาด (${res.status})`, "error"); return }
    booking.status = newStatus
    showToast("อัปเดตสถานะสำเร็จ")
  } catch { showToast("เชื่อมต่อ server ไม่ได้", "error") }
}

async function updatePayment(booking, newPayment) {
  const token = localStorage.getItem("token")
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ payment_status: newPayment }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { showToast(data.message || `ผิดพลาด (${res.status})`, "error"); return }
    booking.payment_status = newPayment
    showToast("อัปเดตการชำระเงินสำเร็จ")
  } catch { showToast("เชื่อมต่อ server ไม่ได้", "error") }
}

async function runConfirm() {
  const token = localStorage.getItem("token")
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${confirmAction.value.booking.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: "cancelled" }),
    })
    if (!res.ok) throw new Error()
    confirmAction.value.booking.status = "cancelled"
    showToast("ยกเลิกการจองสำเร็จ")
  } catch { showToast("เกิดข้อผิดพลาด", "error") }
  showConfirm.value = false
}

async function doAssign() {
  if (!assignPkgId.value) return showToast("กรุณาเลือกแพ็คเกจ", "error")
  const token = localStorage.getItem("token")
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${selectedBooking.value.id}/package`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ package_id: assignPkgId.value, note: assignNote.value }),
    })
    if (!res.ok) throw new Error()
    const pkg = packages.value.find((p) => p.id == assignPkgId.value)
    selectedBooking.value.package_name = pkg?.name
    selectedBooking.value.package_id   = assignPkgId.value
    selectedBooking.value.note         = assignNote.value
    showAssign.value = false
    showToast("กำหนดแพ็คเกจสำเร็จ")
  } catch { showToast("เกิดข้อผิดพลาด", "error") }
}

async function doReschedule() {
  rescheduleError.value = ""
  if (!rescheduleDate.value || !rescheduleTime.value) {
    rescheduleError.value = "กรุณากรอกวันที่และเวลาให้ครบ"; return
  }
  const token = localStorage.getItem("token")
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${selectedBooking.value.id}/reschedule`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ date: rescheduleDate.value, time: rescheduleTime.value }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      rescheduleError.value = data.message ?? "วันและเวลานี้ถูกจองแล้ว"; return
    }
    selectedBooking.value.date = rescheduleDate.value
    selectedBooking.value.time = rescheduleTime.value
    showReschedule.value = false
    showToast("เลื่อนนัดสำเร็จ")
  } catch { rescheduleError.value = "เกิดข้อผิดพลาด กรุณาลองใหม่" }
}

function bid(id) { return `PW-${String(id).padStart(4, "0")}` }

const statusLabel = (s) => ({ pending:"รอดำเนินการ", in_progress:"กำลังดำเนินการ", completed:"เสร็จสิ้น", confirmed:"ยืนยันแล้ว", cancelled:"ยกเลิก" }[s] ?? s)
const statusClass = (s) => ({ pending:"bg-amber-50 text-amber-700 border border-amber-200", in_progress:"bg-blue-50 text-blue-700 border border-blue-200", completed:"bg-emerald-50 text-emerald-700 border border-emerald-200", confirmed:"bg-green-50 text-green-700 border border-green-200", cancelled:"bg-red-50 text-red-700 border border-red-200" }[s])
const paymentLabel = (s) => ({ unpaid:"ยังไม่ชำระ", deposit:"ชำระมัดจำ", paid:"ชำระแล้ว" }[s] ?? "ยังไม่ชำระ")
const paymentClass = (s) => ({ unpaid:"bg-gray-50 text-gray-500 border border-gray-200", deposit:"bg-orange-50 text-orange-600 border border-orange-200", paid:"bg-emerald-50 text-emerald-700 border border-emerald-200" }[s] ?? "bg-gray-50 text-gray-500 border border-gray-200")

const thaiShort  = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]
const thaiMonths = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]

function formatDate(d)      { if (!d) return "-"; const [y,m,dd] = d.split("-"); return `${parseInt(dd)} ${thaiMonths[parseInt(m)-1]} ${parseInt(y)+543}` }
function formatDateShort(d) { if (!d) return "-"; const [y,m,dd] = d.split("-"); return `${parseInt(dd)} ${thaiShort[parseInt(m)-1]} ${parseInt(y)+543}` }

const timeSlots = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]
const chevron   = "background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%239e8e80%22><path fill-rule=%22evenodd%22 d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%22 clip-rule=%22evenodd%22/></svg>'); background-position: right 4px center; background-size: 14px;"
</script>

<template>
<div class="min-h-screen bg-[#f6eee1] flex">
  <sidebar />
  <div class="flex-1 p-6 overflow-auto">

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[#2c2218]">จัดการการจอง</h1>
      <p class="text-sm text-[#9e8e80] mt-0.5">ทั้งหมด {{ filtered.length }} รายการ</p>
    </div>

    <div class="flex flex-wrap gap-3 items-center mb-4">
      <div class="flex items-center gap-2">
        <input v-model="filterFrom" type="date" class="border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>
        <span class="text-[#9e8e80]">–</span>
        <input v-model="filterTo" type="date" class="border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>
      </div>
      <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อ หรือเบอร์โทร..."
        class="flex-1 min-w-[200px] border border-[#ddd5c8] rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>
      <button @click="currentPage = 1" class="px-5 py-2 bg-[#3d2f22] text-white rounded-xl text-sm hover:bg-[#2c2218] transition">ค้นหา</button>
    </div>

    <div class="flex gap-2 mb-5 flex-wrap">
      <button
        v-for="tab in [{key:'all',label:'ทั้งหมด'},{key:'pending',label:'รอดำเนินการ'},{key:'in_progress',label:'กำลังดำเนินการ'},{key:'completed',label:'เสร็จสิ้น'},{key:'cancelled',label:'ยกเลิก'}]"
        :key="tab.key" @click="setFilter(tab.key)"
        class="px-4 py-1.5 rounded-full border text-sm transition"
        :class="filterStatus === tab.key ? 'bg-[#3d2f22] text-white border-transparent' : 'bg-white text-[#7a6a5a] border-[#ddd5c8] hover:border-[#9c7f5e]'"
      >
        {{ tab.label }} <span class="ml-1 opacity-60 text-xs">{{ counts[tab.key] ?? 0 }}</span>
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-4 border-[#e7dcc7] border-t-[#9c7f5e] rounded-full animate-spin"/>
    </div>
    <p v-else-if="error" class="text-center text-red-500 py-12">{{ error }}</p>
    <div v-else-if="paginated.length === 0" class="text-center py-16 text-[#a89880]">
      <div class="text-4xl mb-3"></div><p>ไม่พบรายการ</p>
    </div>

    <div v-else class="bg-white rounded-2xl border border-[#ede8e2] overflow-hidden">
      <table class="w-full">
        <thead class="bg-[#faf7f3]">
          <tr>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">รหัส</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">ลูกค้า</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">วันที่ / เวลา</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">แพ็คเกจ</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">ชำระเงิน</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">สถานะ</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in paginated" :key="b.id"
            class="border-b border-[#f0ece7] hover:bg-[#faf7f3] cursor-pointer transition"
            @click="openDetail(b)">

            <td class="px-5 py-4 text-xs text-[#9e8e80]">{{ bid(b.id) }}</td>

            <td class="px-5 py-4">
              <p class="text-sm font-semibold text-[#2c2218]">{{ b.customer_name }}</p>
              <p class="text-xs text-[#9e8e80]">{{ b.customer_phone }}</p>
            </td>

            <td class="px-5 py-4">
              <p class="text-sm text-[#2c2218]">{{ formatDateShort(b.date) }}</p>
              <p class="text-xs text-[#9e8e80]">{{ b.time }}</p>
            </td>

            <td class="px-5 py-4">
              <span v-if="b.package_name" class="bg-[#e7dcc7] text-[#3d2f22] text-xs px-2 py-1 rounded-full">{{ b.package_name }}</span>
              <span v-else class="text-[#c5b9ac] text-xs">-</span>
            </td>

            <!-- PAYMENT DROPDOWN -->
            <td class="px-5 py-4" @click.stop>
              <select
                :value="b.payment_status || 'unpaid'"
                @change="updatePayment(b, $event.target.value)"
                class="text-xs px-2 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30 transition appearance-none pr-6 bg-no-repeat"
                :class="paymentClass(b.payment_status || 'unpaid')"
                :style="chevron"
              >
                <option value="unpaid">ยังไม่ชำระ</option>
                <option value="deposit">ชำระมัดจำ</option>
                <option value="paid">ชำระแล้ว</option>
              </select>
            </td>

            <!-- STATUS DROPDOWN -->
            <td class="px-5 py-4" @click.stop>
              <select
                :value="b.status"
                @change="updateStatus(b, $event.target.value)"
                class="text-xs px-2 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30 transition appearance-none pr-6 bg-no-repeat"
                :class="statusClass(b.status)"
                :style="chevron"
              >
                <option value="pending">รอดำเนินการ</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </td>

            <td class="px-5 py-4" @click.stop>
              <button @click="openDetail(b)" class="w-8 h-8 bg-[#f0ece7] text-[#7a6a5a] rounded-lg hover:bg-[#e7dcc7] transition text-base">⋯</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-3 border-t border-[#f0ece7]">
        <p class="text-xs text-[#9e8e80]">หน้า {{ currentPage }} / {{ totalPages }}</p>
        <div class="flex gap-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-30 hover:bg-[#f0ece7] transition">‹ ก่อนหน้า</button>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-30 hover:bg-[#f0ece7] transition">ถัดไป ›</button>
        </div>
      </div>
    </div>

  </div>
</div>


<!-- MODAL: DETAIL -->
<Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" leave-active-class="transition duration-150" leave-to-class="opacity-0">
  <div v-if="showDetail" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="showDetail = false">
    <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
      <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#ede8e2]">
        <div>
          <h2 class="text-lg font-bold text-[#2c2218]">{{ selectedBooking?.customer_name }}</h2>
          <p class="text-xs text-[#9e8e80] mt-0.5">{{ bid(selectedBooking?.id) }}</p>
        </div>
        <button @click="showDetail = false" class="w-8 h-8 rounded-full bg-[#f0ece7] hover:bg-[#e3dcd4] transition text-sm">✕</button>
      </div>
      <div class="px-6 py-5 space-y-4">
        <div class="grid grid-cols-2 gap-3 bg-[#faf7f3] rounded-xl p-4 text-sm">
          <div>
            <p class="text-xs text-[#a08c7a]">เบอร์โทร</p>
            <p class="font-semibold">{{ selectedBooking?.customer_phone }}</p>
          </div>
          <div>
            <p class="text-xs text-[#a08c7a]">สถานะ</p>
            <span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass(selectedBooking?.status)">{{ statusLabel(selectedBooking?.status) }}</span>
          </div>
          <div>
            <p class="text-xs text-[#a08c7a]">วันที่</p>
            <p class="font-semibold">{{ formatDate(selectedBooking?.date) }}</p>
          </div>
          <div>
            <p class="text-xs text-[#a08c7a]">เวลา</p>
            <p class="font-semibold">{{ selectedBooking?.time }}</p>
          </div>
          <div>
            <p class="text-xs text-[#a08c7a]">ชำระเงิน</p>
            <span class="text-xs px-2 py-0.5 rounded-full" :class="paymentClass(selectedBooking?.payment_status || 'unpaid')">{{ paymentLabel(selectedBooking?.payment_status || 'unpaid') }}</span>
          </div>
          <div v-if="selectedBooking?.package_name">
            <p class="text-xs text-[#a08c7a]">แพ็คเกจ</p>
            <p class="font-semibold">{{ selectedBooking?.package_name }}</p>
          </div>
          <div v-if="selectedBooking?.note" class="col-span-2">
            <p class="text-xs text-[#a08c7a]">หมายเหตุ</p>
            <p class="font-semibold">{{ selectedBooking?.note }}</p>
          </div>
        </div>
        <div v-if="selectedBooking?.status !== 'cancelled'" class="flex gap-2">
          <button @click="openReschedule(selectedBooking); showDetail = false" class="flex-1 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm hover:bg-blue-100 transition">เลื่อนนัด</button>
          <button @click="openAssign(selectedBooking); showDetail = false" class="flex-1 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm hover:bg-amber-100 transition">แพ็คเกจ</button>
          <button @click="openConfirm('cancel', selectedBooking); showDetail = false" class="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm hover:bg-red-100 transition">ยกเลิก</button>
        </div>
      </div>
    </div>
  </div>
</Transition>


<!-- MODAL: CONFIRM CANCEL -->
<Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-150" leave-to-class="opacity-0 scale-95">
  <div v-if="showConfirm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="showConfirm = false">
    <div class="bg-white rounded-2xl p-6 w-80 shadow-2xl">
      <h3 class="font-bold text-[#2c2218] text-center mb-1">ยืนยันการยกเลิก?</h3>
      <p class="text-sm text-[#9e8e80] text-center mb-5">
        การจองของ <span class="font-semibold text-[#2c2218]">{{ confirmAction?.booking?.customer_name }}</span><br/>
        วันที่ {{ formatDateShort(confirmAction?.booking?.date) }} เวลา {{ confirmAction?.booking?.time }}
      </p>
      <div class="flex gap-3">
        <button @click="showConfirm = false" class="flex-1 py-2 rounded-xl border border-[#ddd5c8] text-sm hover:bg-[#faf7f3] transition">ยกเลิก</button>
        <button @click="runConfirm" class="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition">ยืนยัน</button>
      </div>
    </div>
  </div>
</Transition>


<!-- MODAL: ASSIGN PACKAGE -->
<Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-150" leave-to-class="opacity-0 scale-95">
  <div v-if="showAssign" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="showAssign = false">
    <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#ede8e2]">
        <h3 class="font-bold text-[#2c2218]">กำหนดแพ็คเกจ</h3>
        <button @click="showAssign = false" class="w-7 h-7 rounded-full bg-[#f0ece7] hover:bg-[#e3dcd4] transition text-xs">✕</button>
      </div>
      <div class="px-6 py-5 space-y-3">
        <div>
          <label class="block text-xs text-[#a08c7a] mb-1.5">เลือกแพ็คเกจ</label>
          <select v-model="assignPkgId" class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30 bg-white">
            <option :value="null" disabled>-- เลือกแพ็คเกจ --</option>
            <option v-for="p in packages" :key="p.id" :value="p.id">{{ p.name }}{{ p.price ? ` — ฿${p.price.toLocaleString()}` : '' }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-[#a08c7a] mb-1.5">หมายเหตุ (ถ้ามี)</label>
          <textarea v-model="assignNote" placeholder="เพิ่มหมายเหตุ..." rows="3" class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>
        </div>
        <div class="flex gap-2 pt-1">
          <button @click="showAssign = false" class="flex-1 py-2 rounded-xl border border-[#ddd5c8] text-sm hover:bg-[#faf7f3] transition">ยกเลิก</button>
          <button @click="doAssign" class="flex-1 py-2 rounded-xl bg-[#3d2f22] text-white text-sm hover:bg-[#2c2218] transition">บันทึก</button>
        </div>
      </div>
    </div>
  </div>
</Transition>


<!-- MODAL: RESCHEDULE -->
<Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 scale-95" leave-active-class="transition duration-150" leave-to-class="opacity-0 scale-95">
  <div v-if="showReschedule" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="showReschedule = false">
    <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#ede8e2]">
        <div>
          <h3 class="font-bold text-[#2c2218]">เลื่อนนัด</h3>
          <p class="text-xs text-[#9e8e80]">{{ selectedBooking?.customer_name }}</p>
        </div>
        <button @click="showReschedule = false" class="w-7 h-7 rounded-full bg-[#f0ece7] hover:bg-[#e3dcd4] transition text-xs">✕</button>
      </div>
      <div class="px-6 py-5 space-y-3">
        <div>
          <label class="block text-xs text-[#a08c7a] mb-1.5">วันที่ใหม่</label>
          <input v-model="rescheduleDate" type="date" class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>
        </div>
        <div>
          <label class="block text-xs text-[#a08c7a] mb-1.5">เวลาใหม่</label>
          <select v-model="rescheduleTime" class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30 bg-white">
            <option value="" disabled>-- เลือกเวลา --</option>
            <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <p v-if="rescheduleError" class="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{{ rescheduleError }}</p>
        <div class="flex gap-2 pt-1">
          <button @click="showReschedule = false" class="flex-1 py-2 rounded-xl border border-[#ddd5c8] text-sm hover:bg-[#faf7f3] transition">ยกเลิก</button>
          <button @click="doReschedule" class="flex-1 py-2 rounded-xl bg-[#3d2f22] text-white text-sm hover:bg-[#2c2218] transition">ยืนยันเลื่อนนัด</button>
        </div>
      </div>
    </div>
  </div>
</Transition>

<!-- TOAST -->
<Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 translate-y-2" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
  <div v-if="toast.show"
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2"
    :class="toast.type === 'success' ? 'bg-[#2c2218] text-white' : 'bg-red-500 text-white'">
    <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
    {{ toast.msg }}
  </div>
</Transition>

</template>