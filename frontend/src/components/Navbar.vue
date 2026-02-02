<template>
    <nav class="h-18 bg-[#F0E7D7] shadow px-8 py-4 flex justify-between items-center">

        <img src="/Logo.png" alt="logo" class="h-30 w-auto object-contain">

        <ul class="flex gap-10">
            <li><RouterLink class="text-lg relative text-black font-medium transition hover:text-yellow-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-900 after:transition-all after:duration-400 hover:after:w-full" to="/">หน้าหลัก</RouterLink></li>
            <li><RouterLink class="text-lg relative text-black font-medium transition hover:text-yellow-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-900 after:transition-all after:duration-400 hover:after:w-full" to="/gallery">แกลเลอรี</RouterLink></li>
            <li><RouterLink class="text-lg relative text-black font-medium transition hover:text-yellow-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-yellow-900 after:transition-all after:duration-400 hover:after:w-full" to="/booking">นัดหมายปรึกษา</RouterLink></li>
            <li class="relative text-lg">
                <button @click="togglePackage" type="button" class="flex items-center gap-1">แพ็กเกจ
                    <img src="/arrow.png" class="w-4 h-4 ml-1 transition-transform duration-600" :class="showPackage ? 'rotate-180' : ''" alt="arrow"/>
                </button>
                <div v-show="showPackage" class="absolute left-0 top-full mt-2 w-65 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <RouterLink to="/packagespre-wedding" class="block px-4 py-2 hover:bg-[#d2b48c] transition" @click="closePackage">แพ็กเกจ Pre-wedding</RouterLink>
                    <RouterLink to="/packages" class="block px-4 py-2 hover:bg-[#d2b48c] transition" @click="closePackage">ถ่ายภาพทั่วไป</RouterLink>
                </div>
            </li>
        </ul>

         <RouterLink
            to="/login"
            class="bg-green-500 text-white px-4 py-2 rounded"
            >
            เข้าสู่ระบบ
        </RouterLink>
    </nav>
</template>

<script setup>
import { ref } from "vue";

const isOpen = ref(false);

const showPackage = ref(false);

const togglePackage = () => {
  showPackage.value = !showPackage.value;
};

const closePackage = () => {
  showPackage.value = false;
};
</script>