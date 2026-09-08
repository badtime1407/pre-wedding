<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)
const showPassword = ref(false)

const login = async () => {
  error.value = ""
  loading.value = true

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identifier: email.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      error.value = data.message || "เข้าสู่ระบบไม่สำเร็จ"
      loading.value = false
      return
    }

    // ✅ เก็บ token
    localStorage.setItem("token", data.token)

    // ✅ decode token เพื่อดู role
    const payload = JSON.parse(atob(data.token.split(".")[1]))

    // ✅ redirect ตาม role
    if (payload.role === "admin") {
      router.push("/Admintimetable")
    } else {
      router.push("/")
    }

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
                    <h1 class="text-3xl font-bold text-[#2c2218]">เข้าสู่ระบบ</h1>
                    <p class="text-[#7a6a5a] mt-3">
                        กรอกข้อมูลของคุณเพื่อเข้าสู่ระบบ
                    </p>
                </div>

                <div class="space-y-4">

                    <div>
                        <label class="block text-sm mb-2 font-bold text-[#2c2218]">บัญชีผู้ใช้ / อีเมล</label>
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
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#9c7f5e]/30"/>

                            <img
                                :src="showPassword ? '/view.png' : '/hide.png'"
                                @click="showPassword = !showPassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer"
                            />
                        </div>

                    </div>

                    <div class="text-right mt-2">
                        <RouterLink to="/Resetpassword" class="text-sm text-[#9c7f5e] hover:text-[#3d2f22] font-bold transition">
                            ลืมรหัสผ่าน
                        </RouterLink>
                    </div>

                    <!-- ปุ่ม login เปลี่ยนจาก RouterLink เป็น button -->
                    <button
                        @click="login"
                        :disabled="loading"
                        class="block w-full py-3 rounded-lg bg-[#3d2f22] text-white text-lg font-semibold hover:bg-[#2c2218] transition mt-2 text-center disabled:opacity-60"
                    >
                        {{ loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" }}
                    </button>

                    <!-- แสดง error -->
                    <p v-if="error" class="text-red-500 text-sm text-center mt-2">
                        {{ error }}
                    </p>

                    <p class="text-center text-sm text-[#7a6a5a] mt-5 font-bold">
                        ยังไม่มีบัญชี ?
                        <RouterLink to="/Register" class="text-[#3d2f22] font-bold hover:underline">
                            สมัครสมาชิก
                        </RouterLink>
                    </p>

                </div>
            </div>
        </div>
    </div>
</template>