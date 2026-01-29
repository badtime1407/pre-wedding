<template>
    <div class="bg-[#BDA08C] min-h-screen flex justify-end">
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
                        <label class="block text-sm mb-2 font-bold">บัญชีผู้ใช้ / อีเมล</label>
                        <input
                            type="text"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
                        />
                    </div>

                    <div class="mt-10">
                        <label class="block text-sm font-bold mb-2">รหัสผ่านใหม่</label>
                        <input
                            type="password"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
                        />
                    </div>

                    <div class="mt-10">
                        <label class="block text-sm font-bold mb-2">ยืนยันรหัสผ่านใหม่</label>
                        <input
                            type="password"
                            class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white"
                        />
                    </div>


                    <RouterLink to="/Login" class="block w-full py-3 rounded-lg bg-green-500 text-black text-lg font-semibold hover:bg-green-600 transition mt-10 text-center">
                        ยืนยัน
                    </RouterLink>

                    <p class="text-center text-sm text-gray-600 mt-5 font-bold">
                        ต้องการเข้าสู่ระบบใช่ไหม ?
                        <RouterLink to="/Login" class="text-red-500 font-bold hover:underline">เข้าสู่ระบบ
                        </RouterLink>
                    </p>

                </div>

            </div>

        </div>
    </div>
</template>