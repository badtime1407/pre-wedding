<script setup>
const menus = [
  { name: "ตารางงาน", path: "/Admintimetable" },
  { name: "จัดการงาน", path: "/admin" },
  { name: "แพ็คเก็จ", path: "/Adminpackages" },
  { name: "รายงาน", path: "/Admindashbord" },
]
</script>

<template>
  <div class="w-64 h-screen bg-[#F0E7D7] flex flex-col">

    <!-- Logo -->
    <div class="h-32 flex items-center justify-center border-b border-gray-300">
      <img
        src="/Logo.png"
        alt="logo"
        class="w-40 h-auto object-contain"
      />
    </div>

    <!-- Menu -->
    <div class="flex-1 px-3 py-6 space-y-3">

      <router-link
        v-for="menu in menus"
        :key="menu.path"
        :to="menu.path"
        class="flex items-center gap-4 px-4 py-3 rounded-xl transition hover:bg-white/50"
        active-class="bg-white shadow-sm"
      >
        <span class="text-gray-800 font-medium">
          {{ menu.name }}
        </span>
      </router-link>

    </div>
  </div>
</template>