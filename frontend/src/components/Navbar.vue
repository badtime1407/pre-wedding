<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const showPackage = ref(false)
const showProfile = ref(false)
const isLoggedIn = ref(false)
const isLoggingOut = ref(false)

const profileRef = ref(null)

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

// ปิด popup เมื่อคลิกข้างนอก
const handleClickOutside = (event) => {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showProfile.value = false
  }
}

onMounted(() => {
  const token = localStorage.getItem("token")
  isLoggedIn.value = !!token
  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})

// Logout แบบ smooth
const logout = () => {
  isLoggingOut.value = true

  setTimeout(() => {
    localStorage.removeItem("token")
    isLoggedIn.value = false
    showProfile.value = false
    isLoggingOut.value = false
    router.push("/")
  }, 500)
}
</script>

<template>
  <nav class="h-18 bg-[#F0E7D7] shadow px-8 py-4 flex justify-between items-center">

    <img src="/Logo.png" alt="logo" class="h-30 w-auto object-contain">

    <ul class="flex gap-10">
      <li>
        <RouterLink class="text-lg relative text-black font-medium transition hover:text-yellow-900
        after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px]
        after:w-0 after:bg-yellow-900 after:transition-all after:duration-400
        hover:after:w-full" to="/">
          หน้าหลัก
        </RouterLink>
      </li>

      <li>
        <RouterLink class="text-lg relative text-black font-medium transition hover:text-yellow-900
        after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px]
        after:w-0 after:bg-yellow-900 after:transition-all after:duration-400
        hover:after:w-full" to="/gallery">
          แกลเลอรี
        </RouterLink>
      </li>

      <li>
        <RouterLink class="text-lg relative text-black font-medium transition hover:text-yellow-900
        after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px]
        after:w-0 after:bg-yellow-900 after:transition-all after:duration-400
        hover:after:w-full" to="/booking">
          นัดหมายปรึกษา
        </RouterLink>
      </li>

      <li class="relative text-lg">
        <button @click="togglePackage" type="button" class="flex items-center gap-1">
          แพ็กเกจ
          <img src="/arrow.png"
            class="w-4 h-4 ml-1 transition-transform duration-600"
            :class="showPackage ? 'rotate-180' : ''"
            alt="arrow"/>
        </button>

        <div v-show="showPackage"
          class="absolute left-0 top-full mt-2 w-65 bg-white rounded-lg shadow-lg
          border border-gray-200 overflow-hidden z-50">

          <RouterLink to="/packagespre-wedding"
            class="block px-4 py-2 hover:bg-[#d2b48c] transition"
            @click="closePackage">
            แพ็กเกจ Pre-wedding
          </RouterLink>

          <RouterLink to="/packages"
            class="block px-4 py-2 hover:bg-[#d2b48c] transition"
            @click="closePackage">
            ถ่ายภาพทั่วไป
          </RouterLink>
        </div>
      </li>
    </ul>

    <!-- 🔥 ด้านขวา -->
    <div>
      <!-- ยังไม่ login -->
      <RouterLink
        v-if="!isLoggedIn"
        to="/login"
        class="bg-green-500 text-white px-4 py-2 rounded">
        เข้าสู่ระบบ
      </RouterLink>

      <!-- login แล้ว -->
      <div v-else class="flex items-center gap-6">

        <!-- 🔔 Notification -->
        <button class="relative">
          <svg xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-black hover:text-yellow-900 transition"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118
              14.158V11a6 6 0 10-12 0v3.159c0
              .538-.214 1.055-.595 1.436L4
              17h5m6 0a3 3 0 11-6 0h6z"/>
          </svg>
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            3
          </span>
        </button>

        <!-- 👤 Profile -->
        <div class="relative" ref="profileRef">
          <button @click="toggleProfile">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              class="w-9 h-9 rounded-full border-2 border-gray-300 hover:scale-105 transition"
            />
          </button>

          <transition name="dropdown">
            <div v-if="showProfile"
              class="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg
              border border-gray-200 py-2 z-50"
              :class="isLoggingOut ? 'opacity-0 scale-95' : ''">

              <RouterLink
                to="/"
                class="block px-4 py-2 hover:bg-gray-100 transition"
                @click="closeProfile">
                โปรไฟล์
              </RouterLink>

              <button
                @click="logout"
                class="w-full text-left px-4 py-2 hover:bg-gray-100 transition text-red-500">
                ออกจากระบบ
              </button>
            </div>
          </transition>
        </div>

      </div>
    </div>

  </nav>
</template>

<style scoped>
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