<template>
    <nav class="h-18 bg-[#F0E7D7] shadow px-8 py-4 flex justify-between items-center">
        <div class="">
            <h1>test</h1>
        </div>

        <ul class="flex gap-6">
            <li><RouterLink to="/">หน้าหลัก</RouterLink></li>
            <li><RouterLink to="/gallery">แกลเลอรี</RouterLink></li>
            <li><RouterLink to="/packages">แพ็กเกจ</RouterLink></li>
            <li><RouterLink to="/booking">การจองชุด</RouterLink></li>
            <li><RouterLink to="">เพิ่มเติม</RouterLink></li>
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
</script>