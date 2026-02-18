import { Hono } from "hono"
import { verify } from "hono/jwt"

export const booking = new Hono()

// 🔐 Middleware เช็ค token
booking.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  const token = authHeader.split(" ")[1]

  try {
    const user = await verify(token, c.env.JWT_SECRET)
    c.set("user", user)
    await next()
  } catch {
    return c.json({ message: "Invalid token" }, 401)
  }
})

/* =====================================================
   📌 สร้างการจอง
===================================================== */
booking.post("/", async (c) => {
  const { date, time, customer_name, customer_phone } =
    await c.req.json()

  const user = c.get("user")
  const db = c.env.pre_wedding

  if (!date || !time || !customer_name || !customer_phone) {
    return c.json({ message: "กรอกข้อมูลไม่ครบ" }, 400)
  }

  // 🔥 เช็คว่ามีคนจองวันเวลานี้แล้วไหม
  const existing = await db
    .prepare("SELECT id FROM bookings WHERE date = ? AND time = ?")
    .bind(date, time)
    .first()

  if (existing) {
    return c.json({ message: "วันและเวลานี้ถูกจองแล้ว" }, 400)
  }

  await db
    .prepare(
      `INSERT INTO bookings 
       (user_id, date, time, customer_name, customer_phone)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      user.id,
      date,
      time,
      customer_name,
      customer_phone
    )
    .run()

  return c.json({ message: "จองสำเร็จ" })
})

/* =====================================================
   📌 ดูการจองของตัวเอง
===================================================== */
booking.get("/my", async (c) => {
  const user = c.get("user")
  const db = c.env.pre_wedding

  const bookings = await db
    .prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY date")
    .bind(user.id)
    .all()

  return c.json(bookings.results)
})

/* =====================================================
   📌 Admin ดูทั้งหมด
===================================================== */
booking.get("/", async (c) => {
  const user = c.get("user")
  const db = c.env.pre_wedding

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const bookings = await db
    .prepare(`
      SELECT bookings.*, users.email 
      FROM bookings
      JOIN users ON bookings.user_id = users.id
      ORDER BY date
    `)
    .all()

  return c.json(bookings.results)
})
