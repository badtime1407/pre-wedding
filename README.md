# 💍 Pre-Wedding Studio Booking System

ระบบจองคิวสตูดิโอถ่ายภาพ Pre-Wedding พัฒนาด้วย Vue 3 + Hono (Cloudflare Workers)

## 🔗 Links

- **Website:** [pre-wedding-delta.vercel.app](https://pre-wedding-delta.vercel.app)
- **API:** [backend.patipan.workers.dev](https://backend.patipan.workers.dev)

---

## 🛠️ Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | Vue 3, Vite, Tailwind CSS |
| Backend | Hono, Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Deploy | Vercel (Frontend), Wrangler (Backend) |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
pre-wedding/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions CI/CD
├── frontend/
│   ├── src/
│   │   ├── Pages/           # Vue pages
│   │   ├── components/      # Shared components
│   │   └── router/          # Vue Router
│   ├── public/
│   └── vercel.json          # Vercel SPA config
├── backend/
│   ├── src/
│   │   ├── routes/          # Hono route handlers
│   │   └── index.ts         # Entry point
│   └── wrangler.jsonc       # Cloudflare config
└── README.md
```

---

## ✨ Features

**หน้าผู้ใช้งาน**
- ดูแพ็คเกจ Pre-Wedding และ Event พร้อมราคาโปรโมชั่น
- จองคิวถ่ายภาพ เลือกวันและเวลา
- ดูประวัติการจองและสถานะ
- แจ้งเตือนผ่าน Notification

**หน้า Admin**
- Dashboard แสดงรายได้และสถิติการจอง
- จัดการการจอง (สถานะ, การชำระเงิน, เลื่อนนัด, ยกเลิก)
- ปฏิทินการจองรายเดือน
- จัดการแพ็คเกจพร้อมอัปโหลดรูปภาพและตั้งราคาโปรโมชั่น

---

## 🚀 Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

สร้างไฟล์ `.env` ใน `frontend/`:

```env
VITE_API_URL=https://backend.patipan.workers.dev
```

### Backend

```bash
cd backend
npm install
wrangler dev
```

---

## 🗄️ Database Schema

```sql
-- ผู้ใช้
users: id, name, email, password, role, avatar

-- การจอง
bookings: id, user_id, package_id, date, time, customer_name,
          customer_phone, status, payment_status, note

-- แพ็คเกจ
packages: id, name, description, price, sale_price,
          sale_start, sale_end, image_url, type

-- การแจ้งเตือน
notifications: id, user_id, title, message, is_read, created_at
```

---

## ⚙️ CI/CD

ระบบใช้ GitHub Actions deploy อัตโนมัติไปยัง Vercel ทุกครั้งที่ push ไปที่ branch `main`

**Secrets ที่ต้องตั้งค่าใน GitHub:**

| Secret | คำอธิบาย |
|--------|---------|
| `VERCEL_TOKEN` | Vercel API Token |
| `VERCEL_ORG_ID` | Vercel Organization ID |
| `VERCEL_PROJECT_ID` | Vercel Project ID |
| `VITE_API_URL` | URL ของ Backend API |
---
