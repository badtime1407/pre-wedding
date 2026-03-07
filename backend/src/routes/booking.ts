import { Hono } from "hono"
import { authMiddleware } from "../middleware/authMiddleware"

export const booking = new Hono()

/* =====================================================
   สร้างการจอง
===================================================== */
booking.post("/", authMiddleware, async (c) => {

  const { date, time, customer_name, customer_phone } = await c.req.json()

  const user = c.get("user")
  const db = c.env.pre_wedding

  if (!date || !time || !customer_name || !customer_phone) {
    return c.json({ message: "กรอกข้อมูลไม่ครบ" }, 400)
  }

  const existing = await db
    .prepare(`
      SELECT id 
      FROM bookings 
      WHERE date = ? AND time = ? AND status != 'cancelled'
    `)
    .bind(date, time)
    .first()

  if (existing) {
    return c.json({ message: "วันและเวลานี้ถูกจองแล้ว" }, 409)
  }

  await db
    .prepare(`
      INSERT INTO bookings
      (user_id, date, time, customer_name, customer_phone, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
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
   ผู้ใช้ดูการจองของตัวเอง
===================================================== */
booking.get("/my", authMiddleware, async (c) => {

  const user = c.get("user")
  const db = c.env.pre_wedding

  const result = await db
    .prepare(`
      SELECT
        bookings.*,
        packages.name  AS package_name,
        packages.price AS package_price,
        packages.image_url
      FROM bookings
      LEFT JOIN packages
      ON bookings.package_id = packages.id
      WHERE bookings.user_id = ?
      ORDER BY bookings.date DESC
    `)
    .bind(user.id)
    .all()

  return c.json(result.results)

})


/* =====================================================
   Admin ดูการจองทั้งหมด
===================================================== */
booking.get("/", authMiddleware, async (c) => {

  const user = c.get("user")
  const db = c.env.pre_wedding

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const result = await db
    .prepare(`
      SELECT
        bookings.*,
        users.email,
        packages.name AS package_name
      FROM bookings
      LEFT JOIN users
      ON bookings.user_id = users.id
      LEFT JOIN packages
      ON bookings.package_id = packages.id
      ORDER BY bookings.date DESC
    `)
    .all()

  return c.json(result.results)

})


/* =====================================================
   slot ที่ถูกจอง (calendar)
===================================================== */
booking.get("/occupied", async (c) => {

  const db = c.env.pre_wedding

  const bookings = await db
    .prepare(`
      SELECT date, time
      FROM bookings
      WHERE status != 'cancelled'
    `)
    .all()

  return c.json(bookings.results)

})


/* =====================================================
   Admin ยืนยัน / ยกเลิก
===================================================== */
booking.patch("/:id/status", authMiddleware, async (c) => {

  const user = c.get("user")

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const id = c.req.param("id")
  const { status } = await c.req.json()

  const allowed = ["pending", "confirmed", "cancelled"]

  if (!allowed.includes(status)) {
    return c.json({ message: "สถานะไม่ถูกต้อง" }, 400)
  }

  const db = c.env.pre_wedding

  await db
    .prepare(`UPDATE bookings SET status = ? WHERE id = ?`)
    .bind(status, id)
    .run()

  return c.json({ message: "อัปเดตสถานะสำเร็จ" })

})


/* =====================================================
   Admin เพิ่มแพ็คเกจ
===================================================== */
booking.patch("/:id/package", authMiddleware, async (c) => {

  const user = c.get("user")

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const id = c.req.param("id")
  const { package_id, note } = await c.req.json()

  const db = c.env.pre_wedding

  await db
    .prepare(`UPDATE bookings SET package_id = ?, note = ? WHERE id = ?`)
    .bind(package_id, note ?? null, id)
    .run()

  return c.json({ message: "กำหนดแพ็คเกจสำเร็จ" })

})


/* =====================================================
   Admin เลื่อนนัด  ✅ แก้แล้ว — ไม่เช็ค slot ของตัวเอง
===================================================== */
booking.patch("/:id/reschedule", authMiddleware, async (c) => {

  const user = c.get("user")

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const id = c.req.param("id")
  const { date, time } = await c.req.json()

  if (!date || !time) {
    return c.json({ message: "กรอกข้อมูลไม่ครบ" }, 400)
  }

  const db = c.env.pre_wedding

  // ตรวจ slot ที่ซ้ำ โดยข้าม booking ตัวเองด้วย AND id != ?
  const existing = await db
    .prepare(`
      SELECT id FROM bookings
      WHERE date = ? AND time = ?
      AND status != 'cancelled'
      AND id != ?
    `)
    .bind(date, time, id)
    .first()

  if (existing) {
    return c.json({ message: "วันและเวลานี้ถูกจองแล้ว" }, 409)
  }

  await db
    .prepare(`UPDATE bookings SET date = ?, time = ? WHERE id = ?`)
    .bind(date, time, id)
    .run()

  return c.json({ message: "เลื่อนนัดสำเร็จ" })

})