<template>
  <footer class="bg-[#BDA08C] px-8 md:px-20 py-14">
    <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">

      <!-- แบรนด์ -->
      <div>
        <img src="/Logo.png" class="h-14 object-contain mb-4" />
        <p class="text-sm text-[#3d2f22]/80 leading-relaxed max-w-[32ch]">
          บันทึกทุกช่วงเวลาสำคัญของคุณ ด้วยทีมงานมืออาชีพและแพ็กเกจที่ออกแบบมาเพื่อวันพิเศษของคุณโดยเฉพาะ
        </p>
      </div>

      <!-- เมนู -->
      <div>
        <h2 class="font-semibold text-sm uppercase tracking-wide text-[#3d2f22] mb-4">เมนู</h2>
        <ul class="space-y-2.5">
          <li>
            <RouterLink to="/packagespre-wedding" class="text-sm text-[#3d2f22]/80 hover:text-[#2c2218] transition">
              แพ็กเกจ Pre-wedding
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/packages" class="text-sm text-[#3d2f22]/80 hover:text-[#2c2218] transition">
              แพ็กเกจถ่ายภาพ
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/booking" class="text-sm text-[#3d2f22]/80 hover:text-[#2c2218] transition">
              การจอง
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- ติดต่อเรา -->
      <div>
        <h2 class="font-semibold text-sm uppercase tracking-wide text-[#3d2f22] mb-4">ติดต่อเรา</h2>
        <p class="text-sm text-[#3d2f22]/80">ร้านเปิดทุกวัน 9:00 - 19:00 น.</p>
        <p class="text-sm text-[#3d2f22]/80 mt-1">โทร. 089-565-7443</p>
        <div class="flex items-center gap-3 mt-4">
          <img src="/facebook.png" alt="facebook" class="h-8 w-8 rounded-full hover:opacity-80 transition"/>
          <img src="/line.png" alt="line" class="h-8 w-8 rounded-full hover:opacity-80 transition"/>
        </div>
      </div>

    </div>

    <div class="max-w-6xl mx-auto border-t border-[#3d2f22]/15 mt-10 pt-5">
      <p class="text-xs text-[#3d2f22]/60">© 2026 สงวนลิขสิทธิ์</p>
    </div>
  </footer>
</template>