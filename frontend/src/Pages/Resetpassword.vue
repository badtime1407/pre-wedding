<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const identifier = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const error = ref("")
const loading = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const resetPassword = async () => {
  error.value = ""

  if (!identifier.value || !newPassword.value || !confirmPassword.value) {
    error.value = "กรุณากรอกข้อมูลให้ครบ"
    return
  }

  if (newPassword.value.length < 6) {
    error.value = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "รหัสผ่านไม่ตรงกัน"
    return
  }

  loading.value = true

  try {
    const res = await fetch(
      "http://localhost:8787/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifier: identifier.value,
          newPassword: newPassword.value
        })
      }
    )

    const data = await res.json()

    if (!res.ok) {
      error.value = data.message
      return
    }

    router.push("/login")

  } catch (err) {
    error.value = "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex justify-end bg-[url('/BGlogin.png')] bg-cover bg-center">
    <div class="bg-[#F0E7D7] min-h-screen w-1/2 p-10 flex justify-center">

      <!-- กล่องเนื้อหา -->
      <div class="w-full max-w-md space-y-6">

        <!-- ข้อความ -->
        <div class="text-center">
          <h1 class="text-3xl font-bold">เปลี่ยนรหัสผ่าน</h1>
          <p class="text-gray-600 mt-3">
            กรอกขอมูลของคุณเพื่อเปลี่ยนรหัสผ่าน
          </p>
        </div>

        <!-- ช่องรับข้อมูล -->
        <div class="space-y-4">

          <div class="mt-15">
            <label class="block text-sm mb-2 font-bold">
              บัญชีผู้ใช้ / อีเมล
            </label>
            <input
              v-model="identifier"
              type="text"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
            />
          </div>

          <div class="mt-10">
            <label class="block text-sm font-bold mb-2">
              รหัสผ่านใหม่
            </label>
            <div class="relative">
            <input v-model="newPassword" 
            :type="showNewPassword ? 'text' : 'password'" 
            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white pr-12"/>

            <img
                :src="showNewPassword ? '/view.png' : '/hide.png'"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer"
            />
            </div>

            </div>

          <div class="mt-10">
            <label class="block text-sm font-bold mb-2">
              ยืนยันรหัสผ่านใหม่
            </label>
            <div class="relative">
                <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white pr-12"
                />

                <img
                    :src="showConfirmPassword ? '/view.png' : '/hide.png'"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer"
                />
            </div>
          </div>

          <!-- ปุ่ม -->
          <button
            @click="resetPassword"
            :disabled="loading"
            class="block w-full py-3 rounded-lg bg-green-500 text-black text-lg font-semibold hover:bg-green-600 transition mt-10 text-center"
          >
            {{ loading ? "กำลังเปลี่ยน..." : "ยืนยัน" }}
          </button>

          <!-- error -->
          <p v-if="error" class="text-red-500 text-sm text-center mt-3">
            {{ error }}
          </p>

          <p class="text-center text-sm text-gray-600 mt-5 font-bold">
            ต้องการเข้าสู่ระบบใช่ไหม ?
            <RouterLink
              to="/Login"
              class="text-red-500 font-bold hover:underline"
            >
              เข้าสู่ระบบ
            </RouterLink>
          </p>

        </div>

      </div>

    </div>
  </div>
</template>
