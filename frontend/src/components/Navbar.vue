<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const showPackage = ref(false)
const showProfile = ref(false)
const isLoggedIn = ref(false)
const isLoggingOut = ref(false)

const profileRef = ref(null)
const user = ref(null)

/* =========================
   TOGGLE
========================= */
const togglePackage = () => {
  showPackage.value = !showPackage.value
}

const closePackage = () => {
  showPackage.value = false
}

const toggleProfile = () => {
  showProfile.value = !showProfile.value
}

const closeProfile = () => {
  showProfile.value = false
}

/* =========================
   CLICK OUTSIDE
========================= */
const handleClickOutside = (event) => {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showProfile.value = false
  }
}

/* =========================
   LOAD USER FROM TOKEN
========================= */
onMounted(() => {
  const token = localStorage.getItem("token")

  if (token) {
    isLoggedIn.value = true

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      user.value = payload
    } catch (err) {
      console.error("Invalid token")
    }
  }

  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})

/* =========================
   LOGOUT
========================= */
const logout = () => {
  isLoggingOut.value = true

  setTimeout(() => {
    localStorage.removeItem("token")
    isLoggedIn.value = false
    showProfile.value = false
    user.value = null
    isLoggingOut.value = false
    router.push("/")
  }, 400)
}
</script>

<template>
  <nav class="h-18 bg-[#F0E7D7] shadow px-8 py-4 flex justify-between items-center">

    <!-- LOGO -->
    <img src="/Logo.png" class="h-16 object-contain" />

    <!-- MENU -->
    <ul class="flex gap-10">

      <li>
        <RouterLink
          to="/"
          class="text-lg relative text-black font-medium transition hover:text-yellow-900
          after:content-[''] after:absolute after:left-0 after:-bottom-1
          after:h-[2px] after:w-0 after:bg-yellow-900
          after:transition-all after:duration-300 hover:after:w-full">
          หน้าหลัก
        </RouterLink>
      </li>

      <li>
        <RouterLink
          to="/gallery"
          class="text-lg relative text-black font-medium transition hover:text-yellow-900
          after:content-[''] after:absolute after:left-0 after:-bottom-1
          after:h-[2px] after:w-0 after:bg-yellow-900
          after:transition-all after:duration-300 hover:after:w-full">
          แกลเลอรี
        </RouterLink>
      </li>

      <li>
        <RouterLink
          to="/booking"
          class="text-lg relative text-black font-medium transition hover:text-yellow-900
          after:content-[''] after:absolute after:left-0 after:-bottom-1
          after:h-[2px] after:w-0 after:bg-yellow-900
          after:transition-all after:duration-300 hover:after:w-full">
          นัดหมายปรึกษา
        </RouterLink>
      </li>

      <li>
        <RouterLink
          to="/orderstatus"
          class="text-lg relative text-black font-medium transition hover:text-yellow-900
          after:content-[''] after:absolute after:left-0 after:-bottom-1
          after:h-[2px] after:w-0 after:bg-yellow-900
          after:transition-all after:duration-300 hover:after:w-full">
          สถานะการจัดงาน
        </RouterLink>
      </li>

      <!-- PACKAGE DROPDOWN -->
      <li class="relative text-lg">
        <button @click="togglePackage" class="flex items-center gap-1">
          แพ็กเกจ
          <img src="/arrow.png"
               class="w-4 h-4 transition-transform duration-300"
               :class="showPackage ? 'rotate-180' : ''" />
        </button>

        <div
          v-show="showPackage"
          class="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">

          <RouterLink
            to="/packagespre-wedding"
            class="block px-4 py-2 hover:bg-[#d2b48c] transition"
            @click="closePackage">
            แพ็กเกจ Pre-wedding
          </RouterLink>

          <RouterLink
            to="/packages"
            class="block px-4 py-2 hover:bg-[#d2b48c] transition"
            @click="closePackage">
            แพ็คเกจการจัดงาน
          </RouterLink>

        </div>
      </li>

    </ul>

    <!-- RIGHT SIDE -->
    <div>

      <!-- NOT LOGGED IN -->
      <RouterLink
        v-if="!isLoggedIn"
        to="/login"
        class="bg-green-500 text-white px-4 py-2 rounded">
        เข้าสู่ระบบ
      </RouterLink>

      <!-- LOGGED IN -->
      <div v-else class="flex items-center gap-6">

        <!-- PROFILE -->
        <div class="relative" ref="profileRef">

          <button @click="toggleProfile">
            <img src="/user.png"
                 class="w-10 h-10 rounded-full border-2 border-gray-100 hover:scale-105 transition" />
          </button>

          <!-- PROFILE POPUP -->
          <transition name="dropdown">
            <div
              v-if="showProfile"
              class="absolute right-0 mt-3 w-80 h-100 bg-white shadow-xl rounded-xl border border-gray-200 p-4 z-50"
              :class="isLoggingOut ? 'opacity-0 scale-95' : ''">

              <!-- USER INFO -->
              <div class="border-b pb-3 mb-3 text-center mt-3">
                <p class="font-semibold text-gray-800 text-lg">
                  ชื่อผู้ใช้ : {{ user?.name || 'User' }}
                </p>
                <p class="text-sm text-gray-500 mt-3">
                  Role : {{ user?.role }}
                </p>
              </div>

              <!-- MENU -->
              <RouterLink
                to="/orderstatus"
                class="block px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                @click="closeProfile">
                ดูสถานะการจัดงาน
              </RouterLink>

              <button
                @click="logout"
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
