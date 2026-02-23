import { Hono } from "hono"
import { authMiddleware } from "../middleware/authMiddleware"

export const booking = new Hono()

/* =====================================================
   📌 สร้างการจอง
===================================================== */
booking.post("/", authMiddleware, async (c) => {
  const { date, time, customer_name, customer_phone } =
    await c.req.json()

  const user = c.get("user")
  const db = c.env.pre_wedding

  if (!date || !time || !customer_name || !customer_phone) {
    return c.json({ message: "กรอกข้อมูลไม่ครบ" }, 400)
  }

  // 🔒 ป้องกันจองซ้ำ
  const existing = await db
    .prepare("SELECT id FROM bookings WHERE date = ? AND time = ?")
    .bind(date, time)
    .first()

  if (existing) {
    return c.json({ message: "วันและเวลานี้ถูกจองแล้ว" }, 409)
  }

  await db
  .prepare(
    `INSERT INTO bookings 
     (user_id, date, time, customer_name, customer_phone, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
  .bind(
    user.id,
    date,
    time,
    customer_name,
    customer_phone,
    "confirmed"
  )
  .run()

  return c.json({ message: "จองสำเร็จ" })
})

/* =====================================================
   📌 ดูการจองของตัวเอง
===================================================== */
booking.get("/my", authMiddleware, async (c) => {
  const user = c.get("user")
  const db = c.env.pre_wedding

  const result = await db
    .prepare(
      "SELECT * FROM bookings WHERE user_id = ? ORDER BY date"
    )
    .bind(user.id)
    .all()

  return c.json(result.results)
})

/* =====================================================
   📌 Admin ดูทั้งหมด
===================================================== */
booking.get("/", authMiddleware, async (c) => {
  const user = c.get("user")
  const db = c.env.pre_wedding

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const result = await db
    .prepare(`
      SELECT bookings.*, users.email 
      FROM bookings
      JOIN users ON bookings.user_id = users.id
      ORDER BY date
    `)
    .all()

  return c.json(result.results)
})

booking.get("/occupied", async (c) => {
  const db = c.env.pre_wedding

  const bookings = await db
    .prepare("SELECT date, time FROM bookings WHERE status != 'cancelled'")
    .all()

  return c.json(bookings.results)
})
