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
    const res = await fetch("http://localhost:8787/auth/register", {
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

    alert("สมัครสมาชิกสำเร็จ 🎉")
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
            
            <div class="w-full max-w-md space-y-6">
                
                <div class="text-center">
                    <h1 class="text-3xl font-bold">สมัครสมาชิก</h1>
                    <p class="text-gray-600 mt-3">
                        กรุณากรอกรายละเอียดของคุณเพื่อลงทะเบียน
                    </p>
                </div>

                <div class="space-y-4">

                    <div class="mt-6">
                        <label class="block text-sm mb-2 font-bold">บัญชีผู้ใช้</label>
                        <input
                            v-model="name"
                            type="text"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
                        />
                    </div>

                    <div class="mt-6">
                        <label class="block text-sm mb-2 font-bold">อีเมล</label>
                        <input
                            v-model="email"
                            type="text"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
                        />
                    </div>

                    <div class="mt-6">
                        <label class="block text-sm font-bold mb-2">รหัสผ่าน</label>
                        <div class="relative">
                            <input
                            v-model="password"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
                            />
                            <img
                                :src="showConfirmPassword ? '/view.png' : '/hide.png'"
                                @click="showConfirmPassword = !showConfirmPassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer"
                            />
                        </div>
                        
                    </div>

                    <div class="mt-6">
                        <label class="block text-sm font-bold mb-2">ยืนยันรหัสผ่าน</label>

                        <div class="relative">
                            <input
                            v-model="confirmPassword"
                            :type="showPassword ? 'text' : 'password'"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
                            />

                            <img
                                :src="showPassword ? '/view.png' : '/hide.png'"
                                @click="showPassword = !showPassword"
                                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer"
                            />
                        </div>
                        
                    </div>

                    <!-- เปลี่ยนจาก RouterLink เป็น button -->
                    <button
                        @click="register"
                        :disabled="loading"
                        class="block w-full py-3 rounded-lg bg-green-500 text-black text-lg font-semibold hover:bg-green-600 transition mt-10 text-center"
                    >
                        {{ loading ? "กำลังสมัคร..." : "ยืนยัน" }}
                    </button>

                    <p v-if="error" class="text-red-500 text-sm text-center mt-3">
                        {{ error }}
                    </p>

                    <p class="text-center text-sm text-gray-600 mt-5 font-bold">
                        มีบัญชีอยู่แล้ว ?
                        <RouterLink to="/login" class="text-red-500 font-bold hover:underline">
                            เข้าสู่ระบบ
                        </RouterLink>
                    </p>

                </div>

            </div>

        </div>
    </div>
</template>