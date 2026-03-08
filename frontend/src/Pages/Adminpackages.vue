<script setup>
import { ref, computed, onMounted } from "vue"

const packages   = ref([])
const loading    = ref(true)
const error      = ref("")

const showForm   = ref(false)
const showDelete = ref(false)
const editTarget = ref(null)
const delTarget  = ref(null)

const form = ref({
  name: "", description: "", price: "", image_url: "", type: "event",
  sale_price: "", sale_start: "", sale_end: ""
})
const formError    = ref("")
const formSaving   = ref(false)
const uploading    = ref(false)
const uploadError  = ref("")
const fileInput    = ref(null)
const previewUrl   = ref("")

const toast = ref({ show: false, msg: "", type: "success" })
function showToast(msg, type = "success") {
  toast.value = { show: true, msg, type }
  setTimeout(() => (toast.value.show = false), 3000)
}

onMounted(loadPackages)

async function loadPackages() {
  loading.value = true
  try {
    const token = localStorage.getItem("token")
    const res = await fetch(`${import.meta.env.VITE_API_URL}/packages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error()
    packages.value = await res.json()
  } catch {
    error.value = "โหลดข้อมูลไม่สำเร็จ"
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editTarget.value  = null
  form.value        = { name: "", description: "", price: "", image_url: "", type: "event", sale_price: "", sale_start: "", sale_end: "" }
  formError.value   = ""
  uploadError.value = ""
  previewUrl.value  = ""
  showForm.value    = true
}

function openEdit(pkg) {
  editTarget.value  = pkg
  form.value        = {
    name:        pkg.name        ?? "",
    description: pkg.description ?? "",
    price:       pkg.price       ?? "",
    image_url:   pkg.image_url   ?? "",
    type:        pkg.type        ?? "event",
    sale_price:  pkg.sale_price  ?? "",
    sale_start:  pkg.sale_start  ?? "",
    sale_end:    pkg.sale_end    ?? "",
  }
  formError.value   = ""
  uploadError.value = ""
  previewUrl.value  = pkg.image_url ?? ""
  showForm.value    = true
}

function openDelete(pkg) {
  delTarget.value  = pkg
  showDelete.value = true
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadError.value = ""
  uploading.value   = true
  previewUrl.value  = URL.createObjectURL(file)
  try {
    const token = localStorage.getItem("token")
    const fd    = new FormData()
    fd.append("file", file)
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/packages/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { uploadError.value = data.message || "อัปโหลดไม่สำเร็จ"; previewUrl.value = form.value.image_url; return }
    form.value.image_url = data.url
    previewUrl.value     = data.url
  } catch {
    uploadError.value = "เชื่อมต่อ server ไม่ได้"
    previewUrl.value  = form.value.image_url
  } finally {
    uploading.value = false
  }
}

async function savePackage() {
  formError.value = ""
  if (!form.value.name.trim())                              return (formError.value = "กรุณากรอกชื่อแพ็คเกจ")
  if (!form.value.price || isNaN(Number(form.value.price))) return (formError.value = "กรุณากรอกราคาให้ถูกต้อง")
  if (form.value.sale_price && isNaN(Number(form.value.sale_price))) return (formError.value = "ราคาโปรโมชั่นไม่ถูกต้อง")
  if (form.value.sale_price && Number(form.value.sale_price) >= Number(form.value.price)) return (formError.value = "ราคาโปรโมชั่นต้องน้อยกว่าราคาปกติ")
  if (form.value.sale_price && (!form.value.sale_start || !form.value.sale_end)) return (formError.value = "กรุณากรอกวันเริ่ม-สิ้นสุดโปรโมชั่น")
  if (uploading.value) return (formError.value = "กรุณารอให้อัปโหลดรูปเสร็จก่อน")

  formSaving.value = true
  const token = localStorage.getItem("token")
  const body  = {
    name:        form.value.name.trim(),
    description: form.value.description.trim(),
    price:       Number(form.value.price),
    image_url:   form.value.image_url.trim(),
    type:        form.value.type,
    sale_price:  form.value.sale_price ? Number(form.value.sale_price) : null,
    sale_start:  form.value.sale_start || null,
    sale_end:    form.value.sale_end   || null,
  }

  try {
    let res
    if (editTarget.value) {
      res = await fetch(`${import.meta.env.VITE_API_URL}/packages/${editTarget.value.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
    } else {
      res = await fetch(`${import.meta.env.VITE_API_URL}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      formError.value = d.message || `ผิดพลาด (${res.status})`
      return
    }
    showForm.value = false
    showToast(editTarget.value ? "แก้ไขแพ็คเกจสำเร็จ" : "เพิ่มแพ็คเกจสำเร็จ")
    await loadPackages()
  } catch {
    formError.value = "เชื่อมต่อ server ไม่ได้"
  } finally {
    formSaving.value = false
  }
}

async function confirmDelete() {
  const token = localStorage.getItem("token")
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/packages/${delTarget.value.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error()
    showDelete.value = false
    showToast("ลบแพ็คเกจสำเร็จ")
    await loadPackages()
  } catch {
    showToast("ลบไม่สำเร็จ", "error")
    showDelete.value = false
  }
}

/* ── ตรวจสอบว่าโปรโมชั่นยังใช้งานอยู่ไหม ── */
function isOnSale(pkg) {
  if (!pkg.sale_price || !pkg.sale_start || !pkg.sale_end) return false
  const now = new Date()
  const localDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  return localDate >= pkg.sale_start && localDate <= pkg.sale_end
}

const typeLabel = (t) => ({ "event": "การจัดงาน", "pre-wedding": "พรีเวดดิ้ง" }[t] ?? t)
const typeClass = (t) => ({
  "event":       "bg-rose-50 text-rose-600 border border-rose-200",
  "pre-wedding": "bg-purple-50 text-purple-600 border border-purple-200",
}[t] ?? "bg-gray-100 text-gray-600")

const totalCount = computed(() => packages.value.length)
</script>

<template>
<div class="min-h-screen bg-[#f6eee1] flex">
  <sidebar />
  <div class="flex-1 p-6 overflow-auto">

    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[#2c2218]">จัดการแพ็คเกจ</h1>
        <p class="text-sm text-[#9e8e80] mt-0.5">ทั้งหมด {{ totalCount }} รายการ</p>
      </div>
      <button @click="openAdd"
        class="flex items-center gap-2 px-5 py-2 bg-[#3d2f22] text-white rounded-xl text-sm hover:bg-[#2c2218] transition">
        <span class="text-base">+</span> เพิ่มแพ็คเกจ
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-4 border-[#e7dcc7] border-t-[#9c7f5e] rounded-full animate-spin"/>
    </div>
    <p v-else-if="error" class="text-center text-red-500 py-12">{{ error }}</p>
    <div v-else-if="packages.length === 0" class="text-center py-16 text-[#a89880]">
      <div class="text-4xl mb-3">📦</div><p>ยังไม่มีแพ็คเกจ</p>
    </div>

    <div v-else class="bg-white rounded-2xl border border-[#ede8e2] overflow-hidden">
      <table class="w-full">
        <thead class="bg-[#faf7f3]">
          <tr>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium w-16">รูป</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">ชื่อแพ็คเกจ</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">ประเภท</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">ราคา</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">โปรโมชั่น</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">รายละเอียด</th>
            <th class="px-5 py-3 text-left text-xs text-[#9e8e80] font-medium">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pkg in packages" :key="pkg.id"
            class="border-b border-[#f0ece7] hover:bg-[#faf7f3] transition">

            <td class="px-5 py-4">
              <img v-if="pkg.image_url" :src="pkg.image_url" class="w-12 h-12 rounded-xl object-cover border border-[#ede8e2]"/>
              <div v-else class="w-12 h-12 rounded-xl bg-[#f0ece7] flex items-center justify-center text-[#c5b9ac] text-xl">📷</div>
            </td>

            <td class="px-5 py-4">
              <p class="text-sm font-semibold text-[#2c2218]">{{ pkg.name }}</p>
            </td>

            <td class="px-5 py-4">
              <span class="text-xs px-2 py-1 rounded-full" :class="typeClass(pkg.type)">{{ typeLabel(pkg.type) }}</span>
            </td>

            <td class="px-5 py-4">
              <p class="text-sm font-semibold text-[#2c2218]">฿{{ pkg.price?.toLocaleString() }}</p>
            </td>

            <!-- PROMOTION COLUMN -->
            <td class="px-5 py-4">
              <div v-if="pkg.sale_price">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm font-bold text-rose-600">฿{{ pkg.sale_price?.toLocaleString() }}</span>
                  <span v-if="isOnSale(pkg)" class="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">🔥 ใช้งานอยู่</span>
                  <span v-else class="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">หมดแล้ว</span>
                </div>
                <p class="text-xs text-[#9e8e80] mt-0.5">{{ pkg.sale_start }} – {{ pkg.sale_end }}</p>
              </div>
              <span v-else class="text-[#c5b9ac] text-xs">-</span>
            </td>

            <td class="px-5 py-4 max-w-xs">
              <p class="text-xs text-[#9e8e80] line-clamp-2">{{ pkg.description || "-" }}</p>
            </td>

            <td class="px-5 py-4">
              <div class="flex items-center gap-2">
                <button @click="openEdit(pkg)" class="px-3 py-1.5 rounded-lg bg-[#f0ece7] text-[#3d2f22] text-xs hover:bg-[#e7dcc7] transition">✏️ แก้ไข</button>
                <button @click="openDelete(pkg)" class="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 transition">🗑️ ลบ</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>


<!-- MODAL: ADD / EDIT -->
<Transition enter-active-class="transition duration-200" enter-from-class="opacity-0"
            leave-active-class="transition duration-150" leave-to-class="opacity-0">
  <div v-if="showForm"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    @click.self="showForm = false">
    <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

      <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#ede8e2]">
        <h3 class="font-bold text-[#2c2218]">{{ editTarget ? "✏️ แก้ไขแพ็คเกจ" : "📦 เพิ่มแพ็คเกจใหม่" }}</h3>
        <button @click="showForm = false" class="w-7 h-7 rounded-full bg-[#f0ece7] hover:bg-[#e3dcd4] transition text-xs">✕</button>
      </div>

      <div class="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

        <!-- ชื่อ -->
        <div>
          <label class="block text-xs text-[#a08c7a] mb-1.5">ชื่อแพ็คเกจ <span class="text-red-400">*</span></label>
          <input v-model="form.name" type="text" placeholder="เช่น Wedding Full Package"
            class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>
        </div>

        <!-- ราคา + ประเภท -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-[#a08c7a] mb-1.5">ราคาปกติ (บาท) <span class="text-red-400">*</span></label>
            <input v-model="form.price" type="number" placeholder="25000"
              class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>
          </div>
          <div>
            <label class="block text-xs text-[#a08c7a] mb-1.5">ประเภท <span class="text-red-400">*</span></label>
            <select v-model="form.type"
              class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30 bg-white">
              <option value="event">การจัดงาน</option>
              <option value="pre-wedding">พรีเวดดิ้ง</option>
            </select>
          </div>
        </div>

        <!-- อัปโหลดรูป -->
        <div>
          <label class="block text-xs text-[#a08c7a] mb-1.5">รูปภาพ</label>
          <div class="border-2 border-dashed border-[#ddd5c8] rounded-xl p-4 text-center cursor-pointer hover:border-[#9c7f5e] transition"
            @click="fileInput.click()">
            <img v-if="previewUrl" :src="previewUrl" class="w-full h-36 object-cover rounded-lg mb-2"/>
            <div v-if="uploading" class="flex items-center justify-center gap-2 text-[#9c7f5e] text-sm py-2">
              <div class="w-4 h-4 border-2 border-[#e7dcc7] border-t-[#9c7f5e] rounded-full animate-spin"/>
              กำลังอัปโหลด...
            </div>
            <div v-else class="text-[#a08c7a] text-sm py-2">
              <div class="text-2xl mb-1">📁</div>
              {{ previewUrl ? "คลิกเพื่อเปลี่ยนรูป" : "คลิกเพื่ออัปโหลดรูป" }}
              <p class="text-xs text-[#c5b9ac] mt-0.5">JPG, PNG, WEBP</p>
            </div>
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleFileChange"/>
          </div>
          <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
          <div class="mt-2">
            <p class="text-xs text-[#c5b9ac] mb-1">หรือใส่ URL รูปภาพโดยตรง</p>
            <input v-model="form.image_url" type="text" placeholder="https://..."
              @input="previewUrl = form.image_url"
              class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>
          </div>
        </div>

        <!-- รายละเอียด -->
        <div>
          <label class="block text-xs text-[#a08c7a] mb-1.5">รายละเอียด</label>
          <textarea v-model="form.description" rows="4" placeholder="อธิบายรายละเอียดแพ็คเกจ..."
            class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>
        </div>

        <!-- โปรโมชั่น -->
        <div class="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-3">
          <p class="text-xs font-semibold text-rose-600">🔥 ตั้งราคาโปรโมชั่น (ถ้ามี)</p>
          <div>
            <label class="block text-xs text-[#a08c7a] mb-1.5">ราคาโปรโมชั่น (บาท)</label>
            <input v-model="form.sale_price" type="number" placeholder="เช่น 19900"
              class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-[#a08c7a] mb-1.5">วันเริ่มต้น</label>
              <input v-model="form.sale_start" type="date"
                class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"/>
            </div>
            <div>
              <label class="block text-xs text-[#a08c7a] mb-1.5">วันสิ้นสุด</label>
              <input v-model="form.sale_end" type="date"
                class="w-full border border-[#ddd5c8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"/>
            </div>
          </div>
          <p class="text-xs text-[#a08c7a]">หากไม่ต้องการโปรโมชั่น ให้เว้นว่างไว้</p>
        </div>

        <p v-if="formError" class="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{{ formError }}</p>

        <div class="flex gap-2 pt-1">
          <button @click="showForm = false"
            class="flex-1 py-2 rounded-xl border border-[#ddd5c8] text-sm hover:bg-[#faf7f3] transition">
            ยกเลิก
          </button>
          <button @click="savePackage" :disabled="formSaving || uploading"
            class="flex-1 py-2 rounded-xl bg-[#3d2f22] text-white text-sm hover:bg-[#2c2218] transition disabled:opacity-50">
            {{ formSaving ? "กำลังบันทึก..." : (editTarget ? "บันทึกการแก้ไข" : "เพิ่มแพ็คเกจ") }}
          </button>
        </div>

      </div>
    </div>
  </div>
</Transition>


<!-- MODAL: CONFIRM DELETE -->
<Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 scale-95"
            leave-active-class="transition duration-150" leave-to-class="opacity-0 scale-95">
  <div v-if="showDelete"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    @click.self="showDelete = false">
    <div class="bg-white rounded-2xl p-6 w-80 shadow-2xl">
      <div class="text-3xl mb-3 text-center">🗑️</div>
      <h3 class="font-bold text-[#2c2218] text-center mb-1">ยืนยันการลบ?</h3>
      <p class="text-sm text-[#9e8e80] text-center mb-5">
        แพ็คเกจ <span class="font-semibold text-[#2c2218]">{{ delTarget?.name }}</span><br/>
        จะถูกลบถาวรและไม่สามารถกู้คืนได้
      </p>
      <div class="flex gap-3">
        <button @click="showDelete = false" class="flex-1 py-2 rounded-xl border border-[#ddd5c8] text-sm hover:bg-[#faf7f3] transition">ยกเลิก</button>
        <button @click="confirmDelete" class="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition">ลบเลย</button>
      </div>
    </div>
  </div>
</Transition>


<!-- TOAST -->
<Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 translate-y-2"
            leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
  <div v-if="toast.show"
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl text-sm font-medium flex items-center gap-2"
    :class="toast.type === 'success' ? 'bg-[#2c2218] text-white' : 'bg-red-500 text-white'">
    <span>{{ toast.type === 'success' ? '✓' : '✕' }}</span>
    {{ toast.msg }}
  </div>
</Transition>

</template>