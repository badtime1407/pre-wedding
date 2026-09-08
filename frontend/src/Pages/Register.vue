<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const name = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const error = ref("")
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const register = async () => {
  error.value = ""

  if (!name.value || !email.value || !password.value) {
    error.value = "กรุณากรอกข้อมูลให้ครบ"
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = "รหัสผ่านไม่ตรงกัน"
    return
  }

  loading.value = true

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value
      })
    })

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
        <div class="bg-[#F0E7D7] min-h-screen w-full md:w-1/2 p-6 sm:p-10 flex justify-center">

            <div class="w-full max-w-md space-y-6 my-auto">

                <div class="text-center">
                    <h1 class="text-3xl font-bold text-[#2c2218]">สมัครสมาชิก</h1>
                    <p class="text-[#7a6a5a] mt-3">
                        กรุณากรอกรายละเอียดของคุณเพื่อลงทะเบียน
                    </p>
                </div>

                <div class="space-y-4">

                    <div>
                        <label class="block text-sm mb-2 font-bold text-[#2c2218]">บัญชีผู้ใช้</label>
                        <input
                            v-model="name"
                            type="text"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"
                        />
                    </div>

                    <div>
                        <label class="block text-sm mb-2 font-bold text-[#2c2218]">อีเมล</label>
                        <input
                            v-model="email"
                            type="text"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-bold mb-2 text-[#2c2218]">รหัสผ่าน</label>
                        <div class="relative">
                            <input
                            v-model="password"
                            :type="showPassword ? 'text' : 'password'"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"
                            />
                            <img
                                :src="showPassword ? '/view.png' : '/hide.png'"
                                @click="showPassword = !showPassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer"
                            />
                        </div>

                    </div>

                    <div>
                        <label class="block text-sm font-bold mb-2 text-[#2c2218]">ยืนยันรหัสผ่าน</label>

                        <div class="relative">
                            <input
                            v-model="confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"
                            />

                            <img
                                :src="showConfirmPassword ? '/view.png' : '/hide.png'"
                                @click="showConfirmPassword = !showConfirmPassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer"
                            />
                        </div>

                    </div>

                    <!-- เปลี่ยนจาก RouterLink เป็น button -->
                    <button
                        @click="register"
                        :disabled="loading"
                        class="block w-full py-3 rounded-lg bg-[#3d2f22] text-white text-lg font-semibold hover:bg-[#2c2218] transition mt-6 text-center disabled:opacity-60"
                    >
                        {{ loading ? "กำลังสมัคร..." : "ยืนยัน" }}
                    </button>

                    <p v-if="error" class="text-red-500 text-sm text-center mt-3">
                        {{ error }}
                    </p>

                    <p class="text-center text-sm text-[#7a6a5a] mt-5 font-bold">
                        มีบัญชีอยู่แล้ว ?
                        <RouterLink to="/login" class="text-[#3d2f22] font-bold hover:underline">
                            เข้าสู่ระบบ
                        </RouterLink>
                    </p>

                </div>

            </div>

        </div>
    </div>
</template>