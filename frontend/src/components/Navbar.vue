<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const showPackage  = ref(false)
const showProfile  = ref(false)
const isLoggedIn   = ref(false)
const isLoggingOut = ref(false)
const profileRef   = ref(null)
const user         = ref(null)
const avatarUrl    = ref(null)

/* ── AVATAR UPLOAD ── */
const showAvatarModal = ref(false)
const avatarFileInput = ref(null)
const avatarPreview   = ref(null)
const avatarFile      = ref(null)
const avatarUploading = ref(false)
const avatarError     = ref("")

function openAvatarModal() {
  showProfile.value   = false
  avatarPreview.value = avatarUrl.value
  avatarFile.value    = null
  avatarError.value   = ""
  showAvatarModal.value = true
}

function handleAvatarFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const allowed = ["image/jpeg", "image/png", "image/webp"]
  if (!allowed.includes(file.type)) {
    avatarError.value = "รองรับเฉพาะ JPG, PNG, WEBP"
    return
  }
  avatarError.value   = ""
  avatarFile.value    = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function uploadAvatar() {
  if (!avatarFile.value) return
  avatarUploading.value = true
  avatarError.value     = ""
  try {
    const token = localStorage.getItem("token")
    const fd    = new FormData()
    fd.append("file", avatarFile.value)
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/user/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { avatarError.value = data.message || "อัปโหลดไม่สำเร็จ"; return }
    avatarUrl.value       = data.avatar
    showAvatarModal.value = false
  } catch {
    avatarError.value = "เชื่อมต่อ server ไม่ได้"
  } finally {
    avatarUploading.value = false
  }
}

/* ── NOTIFICATIONS ── */
const showNotif     = ref(false)
const notifications = ref([])
const notifRef      = ref(null)
let   pollTimer     = null

const unreadCount = computed(() =>
  notifications.value.filter((n) => !n.is_read).length
)

async function fetchNotifications() {
  if (!isLoggedIn.value) return
  try {
    const token = localStorage.getItem("token")
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/bookings/notifications`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (res.ok) notifications.value = await res.json()
  } catch {}
}

async function fetchProfile() {
  try {
    const token = localStorage.getItem("token")
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      avatarUrl.value = data.avatar || null
    }
  } catch {}
}

async function markRead(n) {
  if (n.is_read) return
  try {
    const token = localStorage.getItem("token")
    await fetch(
      `${import.meta.env.VITE_API_URL}/bookings/notifications/${n.id}/read`,
      { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
    )
    n.is_read = 1
  } catch {}
}

async function markAllRead() {
  const unread = notifications.value.filter((n) => !n.is_read)
  await Promise.all(unread.map(markRead))
}

function toggleNotif() {
  showNotif.value = !showNotif.value
  if (showNotif.value) markAllRead()
}

/* ── TOGGLE ── */
const togglePackage = () => { showPackage.value = !showPackage.value }
const closePackage  = () => { showPackage.value = false }
const toggleProfile = () => { showProfile.value = !showProfile.value }
const closeProfile  = () => { showProfile.value = false }

/* ── CLICK OUTSIDE ── */
const handleClickOutside = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target))
    showProfile.value = false
  if (notifRef.value && !notifRef.value.contains(e.target))
    showNotif.value = false
}

/* ── MOUNT ── */
onMounted(() => {
  const token = localStorage.getItem("token")
  if (token) {
    isLoggedIn.value = true
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      user.value = payload
      fetchNotifications()
      fetchProfile()
      pollTimer = setInterval(fetchNotifications, 30000)
    } catch {}
  }
  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
  if (pollTimer) clearInterval(pollTimer)
})

/* ── LOGOUT ── */
const logout = () => {
  isLoggingOut.value = true
  clearInterval(pollTimer)
  setTimeout(() => {
    localStorage.removeItem("token")
    isLoggedIn.value    = false
    showProfile.value   = false
    user.value          = null
    avatarUrl.value     = null
    notifications.value = []
    isLoggingOut.value  = false
    router.push("/")
  }, 400)
}

/* ── HELPERS ── */
function timeAgo(dateStr) {
  if (!dateStr) return ""
  const utcDate = new Date(dateStr + "Z")
  const diff = Date.now() - utcDate.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return "เมื่อกี้"
  if (m < 60) return `${m} นาทีที่แล้ว`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`
  return `${Math.floor(h / 24)} วันที่แล้ว`
}

function notifIcon(title) {
  if (title?.includes("เลื่อน")) return "/calendar.png"
  if (title?.includes("ยกเลิก")) return "/cancel.png"
  return "/notification.png"
}
</script>

<template>
  <nav class="h-18 bg-[#F0E7D7] shadow px-8 py-4 flex justify-between items-center">

    <!-- LOGO -->
    <img src="/Logo.png" class="h-16 object-contain" />

    <!-- MENU -->
    <ul class="flex gap-10">
      <li>
        <RouterLink to="/"
          class="text-lg relative text-black font-medium transition hover:text-yellow-900
          after:content-[''] after:absolute after:left-0 after:-bottom-1
          after:h-[2px] after:w-0 after:bg-yellow-900
          after:transition-all after:duration-300 hover:after:w-full">
          หน้าหลัก
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/gallery"
          class="text-lg relative text-black font-medium transition hover:text-yellow-900
          after:content-[''] after:absolute after:left-0 after:-bottom-1
          after:h-[2px] after:w-0 after:bg-yellow-900
          after:transition-all after:duration-300 hover:after:w-full">
          แกลเลอรี
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/booking"
          class="text-lg relative text-black font-medium transition hover:text-yellow-900
          after:content-[''] after:absolute after:left-0 after:-bottom-1
          after:h-[2px] after:w-0 after:bg-yellow-900
          after:transition-all after:duration-300 hover:after:w-full">
          นัดหมายปรึกษา
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/orderstatus"
          class="text-lg relative text-black font-medium transition hover:text-yellow-900
          after:content-[''] after:absolute after:left-0 after:-bottom-1
          after:h-[2px] after:w-0 after:bg-yellow-900
          after:transition-all after:duration-300 hover:after:w-full">
          สถานะการจัดงาน
        </RouterLink>
      </li>
      <li class="relative text-lg">
        <button @click="togglePackage" class="flex items-center gap-1">
          แพ็กเกจ
          <img src="/arrow.png"
               class="w-4 h-4 transition-transform duration-300"
               :class="showPackage ? 'rotate-180' : ''" />
        </button>
        <div v-show="showPackage"
          class="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <RouterLink to="/packagespre-wedding"
            class="block px-4 py-2 hover:bg-[#d2b48c] transition"
            @click="closePackage">
            แพ็กเกจ Pre-wedding
          </RouterLink>
          <RouterLink to="/packages"
            class="block px-4 py-2 hover:bg-[#d2b48c] transition"
            @click="closePackage">
            แพ็คเกจการจัดงาน
          </RouterLink>
        </div>
      </li>
    </ul>

    <!-- RIGHT SIDE -->
    <div>
      <RouterLink v-if="!isLoggedIn" to="/login"
        class="bg-green-500 text-white px-4 py-2 rounded">
        เข้าสู่ระบบ
      </RouterLink>

      <div v-else class="flex items-center gap-4">

        <!-- 🔔 NOTIFICATION BELL -->
        <div class="relative" ref="notifRef">
          <button @click.stop="toggleNotif"
            class="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e0d4c0] transition">
            <img src="/notification.png" class="w-6 h-6" />
            <span v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <transition name="dropdown">
            <div v-if="showNotif"
              class="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-200 z-50 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-3 border-b bg-[#faf7f3]">
                <p class="font-semibold text-sm text-[#2c2218]">การแจ้งเตือน</p>
                <button v-if="unreadCount > 0" @click="markAllRead"
                  class="text-xs text-[#9c7f5e] hover:underline">
                  อ่านทั้งหมด
                </button>
              </div>
              <div class="max-h-80 overflow-y-auto divide-y divide-gray-100">
                <div v-if="notifications.length === 0"
                  class="py-10 text-center text-sm text-gray-400">
                  ไม่มีการแจ้งเตือน
                </div>
                <div v-for="n in notifications" :key="n.id"
                  @click="markRead(n)"
                  class="flex gap-3 px-4 py-3 cursor-pointer transition"
                  :class="n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-amber-50 hover:bg-amber-100'">
                  <img :src="notifIcon(n.title)" class="w-6 h-6 mt-0.5 shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-[#2c2218] truncate">{{ n.title }}</p>
                    <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ n.message }}</p>
                    <p class="text-[10px] text-gray-400 mt-1">{{ timeAgo(n.created_at) }}</p>
                  </div>
                  <div v-if="!n.is_read" class="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0"/>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- PROFILE -->
        <div class="relative" ref="profileRef">
          <button @click="toggleProfile">
            <!-- แสดง avatar ถ้ามี ไม่งั้นใช้รูป default -->
            <img
              :src="avatarUrl || '/user.png'"
              class="w-10 h-10 rounded-full border-2 border-gray-100 hover:scale-105 transition object-cover"
            />
          </button>

          <transition name="dropdown">
            <div v-if="showProfile"
              class="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-200 p-4 z-50"
              :class="isLoggingOut ? 'opacity-0 scale-95' : ''">

              <!-- Avatar + ชื่อ -->
              <div class="border-b pb-4 mb-3 text-center">
                <div class="relative inline-block mb-3">
                  <img
                    :src="avatarUrl || '/user.png'"
                    class="w-20 h-20 rounded-full border-2 border-[#e7dcc7] object-cover mx-auto"
                  />
                  <button
                    @click="openAvatarModal"
                    class="absolute bottom-0 right-0 w-6 h-6 text-white rounded-full text-xs flex items-center justify-center hover:bg-white transition"
                    title="เปลี่ยนรูปโปรไฟล์">
                    <img src="/edit.png" class="w-3 h-3" />
                  </button>
                </div>
                <p class="font-semibold text-gray-800 text-lg">{{ user?.name || 'User' }}</p>
              </div>

              <RouterLink to="/orderstatus"
                class="block px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                @click="closeProfile">
                ดูสถานะการจัดงาน
              </RouterLink>
              <button @click="logout"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition text-red-500">
                ออกจากระบบ
              </button>
            </div>
          </transition>
        </div>

      </div>
    </div>
  </nav>

  <!-- MODAL: UPLOAD AVATAR -->
  <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0"
              leave-active-class="transition duration-150" leave-to-class="opacity-0">
    <div v-if="showAvatarModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4"
      @click.self="showAvatarModal = false">
      <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#ede8e2]">
          <h3 class="font-bold text-[#2c2218]">เปลี่ยนรูปโปรไฟล์</h3>
          <button @click="showAvatarModal = false"
            class="w-7 h-7 rounded-full bg-[#f0ece7] hover:bg-[#e3dcd4] transition text-xs">✕</button>
        </div>

        <div class="px-6 py-5 space-y-4">

          <!-- Preview -->
          <div class="flex flex-col items-center gap-3">
            <img
              :src="avatarPreview || '/user.png'"
              class="w-28 h-28 rounded-full border-4 border-[#e7dcc7] object-cover"
            />
            <button
              @click="avatarFileInput.click()"
              class="px-4 py-2 rounded-xl border border-[#ddd5c8] text-sm text-[#3d2f22] hover:bg-[#f0ece7] transition">
              เลือกรูปภาพ
            </button>
            <input ref="avatarFileInput" type="file" accept="image/jpeg,image/png,image/webp"
              class="hidden" @change="handleAvatarFile"/>
            <p class="font-semibold text-gray-800 text-lg">Username : {{ user?.name || 'User' }}</p>
          </div>

          <p v-if="avatarError" class="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg text-center">
            {{ avatarError }}
          </p>

          <div class="flex gap-2">
            <button @click="showAvatarModal = false"
              class="flex-1 py-2 rounded-xl border border-[#ddd5c8] text-sm hover:bg-[#faf7f3] transition">
              ยกเลิก
            </button>
            <button
              @click="uploadAvatar"
              :disabled="!avatarFile || avatarUploading"
              class="flex-1 py-2 rounded-xl bg-[#3d2f22] text-white text-sm hover:bg-[#2c2218] transition disabled:opacity-50">
              {{ avatarUploading ? "กำลังอัปโหลด..." : "บันทึก" }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </Transition>

</template>

<style>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.dropdown-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>