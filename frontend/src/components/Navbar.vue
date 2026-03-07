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

/* ── NOTIFICATIONS ── */
const showNotif    = ref(false)
const notifications = ref([])
const notifRef     = ref(null)
let   pollTimer    = null

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
      // ดึงทันที แล้ว poll ทุก 30 วินาที
      fetchNotifications()
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
    isLoggedIn.value  = false
    showProfile.value = false
    user.value        = null
    notifications.value = []
    isLoggingOut.value  = false
    router.push("/")
  }, 400)
}

/* ── HELPERS ── */
function timeAgo(dateStr) {
  if (!dateStr) return ""
  // บวก 7 ชั่วโมงให้ UTC เป็นเวลาไทย
  const utcDate = new Date(dateStr + "Z") // เติม Z บอกว่าเป็น UTC
  const diff = Date.now() - utcDate.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return "เมื่อกี้"
  if (m < 60) return `${m} นาทีที่แล้ว`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`
  return `${Math.floor(h / 24)} วันที่แล้ว`
}

function notifIcon(title) {
  if (title?.includes("เลื่อน")) return "📅"
  if (title?.includes("ยกเลิก")) return "❌"
  return "🔔"
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
            <span class="text-xl">🔔</span>
            <!-- badge -->
            <span v-if="unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- DROPDOWN -->
          <transition name="dropdown">
            <div v-if="showNotif"
              class="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-200 z-50 overflow-hidden">

              <!-- header -->
              <div class="flex items-center justify-between px-4 py-3 border-b bg-[#faf7f3]">
                <p class="font-semibold text-sm text-[#2c2218]">การแจ้งเตือน</p>
                <button v-if="unreadCount > 0"
                  @click="markAllRead"
                  class="text-xs text-[#9c7f5e] hover:underline">
                  อ่านทั้งหมด
                </button>
              </div>

              <!-- list -->
              <div class="max-h-80 overflow-y-auto divide-y divide-gray-100">

                <div v-if="notifications.length === 0"
                  class="py-10 text-center text-sm text-gray-400">
                  ไม่มีการแจ้งเตือน
                </div>

                <div
                  v-for="n in notifications" :key="n.id"
                  @click="markRead(n)"
                  class="flex gap-3 px-4 py-3 cursor-pointer transition"
                  :class="n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-amber-50 hover:bg-amber-100'"
                >
                  <div class="text-xl mt-0.5 shrink-0">{{ notifIcon(n.title) }}</div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-[#2c2218] truncate">{{ n.title }}</p>
                    <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ n.message }}</p>
                    <p class="text-[10px] text-gray-400 mt-1">{{ timeAgo(n.created_at) }}</p>
                  </div>
                  <div v-if="!n.is_read"
                    class="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0"/>
                </div>

              </div>

            </div>
          </transition>
        </div>

        <!-- PROFILE -->
        <div class="relative" ref="profileRef">
          <button @click="toggleProfile">
            <img src="/user.png"
                 class="w-10 h-10 rounded-full border-2 border-gray-100 hover:scale-105 transition" />
          </button>

          <transition name="dropdown">
            <div v-if="showProfile"
              class="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-200 p-4 z-50"
              :class="isLoggingOut ? 'opacity-0 scale-95' : ''">
              <div class="border-b pb-3 mb-3 text-center mt-3">
                <p class="font-semibold text-gray-800 text-lg">
                  ชื่อผู้ใช้ : {{ user?.name || 'User' }}
                </p>
                <p class="text-sm text-gray-500 mt-3">Role : {{ user?.role }}</p>
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