<template>
    <div class="bg-[#BDA08C] min-h-screen flex justify-end">
        <div class="bg-[#F0E7D7] min-h-screen w-1/2 p-10 flex justify-center">
            
            <!-- กล่องเนื้อหา -->
            <div class="w-full max-w-md space-y-6">
                
                <!-- ข้อความ -->
                <div class="text-center">
                    <h1 class="text-3xl font-bold">เข้าสู่ระบบ</h1>
                    <p class="text-gray-600 mt-3">
                        กรอกข้อมูลของคุณเพื่อเข้าสู่ระบบ
                    </p>
                </div>

                <!-- ช่องรับข้อมูล -->
                <div class="space-y-4">
                    <div class="mt-15">
                        <label class="block text-sm mb-2 font-bold">บัญชีผู้ใช้ / อีเมล</label>
                        <input
                            type="text"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
                        />
                    </div>

                    <div class="mt-10">
                        <label class="block text-sm font-bold mb-2">รหัสผ่าน</label>
                        <input
                            type="password"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
                        />
                    </div>

                    <div class="text-right mt-2">
                        <RouterLink to="/Resetpassword" class="text-sm text-red-400 hover:underline font-bold">
                            ลืมรหัสผ่าน
                        </RouterLink>
                    </div>

                    <RouterLink to="/" class="block w-full py-3 rounded-lg bg-green-500 text-black text-lg font-semibold hover:bg-green-600 transition mt-2 text-center">
                        ยืนยัน
                    </RouterLink>

                    <p class="text-center text-sm text-gray-600 mt-5 font-bold">
                        ยังไม่มีบัญชี ?
                        <RouterLink to="/Register" class="text-red-500 font-bold hover:underline">สมัครสมาชิก
                        </RouterLink>
                    </p>

                </div>

            </div>

        </div>
    </div>
</template>