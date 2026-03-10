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
    .prepare(`SELECT id FROM bookings WHERE date = ? AND time = ? AND status != 'cancelled'`)
    .bind(date, time)
    .first()

  if (existing) {
    return c.json({ message: "วันและเวลานี้ถูกจองแล้ว" }, 409)
  }

  await db
    .prepare(`INSERT INTO bookings (user_id, date, time, customer_name, customer_phone, status) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(user.id, date, time, customer_name, customer_phone, "pending")
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
      SELECT bookings.*,
             packages.name       AS package_name,
             packages.price      AS package_price,
             packages.image_url,
             packages.sale_price AS package_sale_price,
             packages.sale_start AS package_sale_start,
             packages.sale_end   AS package_sale_end
      FROM bookings
      LEFT JOIN packages ON bookings.package_id = packages.id
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
      SELECT bookings.*,
             users.email,
             packages.name       AS package_name,
             packages.price      AS package_price,
             packages.sale_price AS package_sale_price,
             packages.sale_start AS package_sale_start,
             packages.sale_end   AS package_sale_end
      FROM bookings
      LEFT JOIN users    ON bookings.user_id    = users.id
      LEFT JOIN packages ON bookings.package_id = packages.id
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
    .prepare(`SELECT date, time FROM bookings WHERE status != 'cancelled'`)
    .all()

  return c.json(bookings.results)

})


/* =====================================================
   ดึง notifications ของ user
   ⚠️ ต้องอยู่เหนือ /:id routes ทั้งหมด
===================================================== */
booking.get("/notifications", authMiddleware, async (c) => {

  const user = c.get("user")
  const db = c.env.pre_wedding

  const result = await db
    .prepare(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`)
    .bind(user.id)
    .all()

  return c.json(result.results)

})


/* =====================================================
   Mark notification as read
   ⚠️ ต้องอยู่เหนือ /:id routes ทั้งหมด
===================================================== */
booking.patch("/notifications/:id/read", authMiddleware, async (c) => {

  const db = c.env.pre_wedding
  const id = c.req.param("id")

  await db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ?`).bind(id).run()

  return c.json({ message: "ok" })

})


/* =====================================================
   Admin เปลี่ยนสถานะ
===================================================== */
booking.patch("/:id/status", authMiddleware, async (c) => {

  const user = c.get("user")
  if (user.role !== "admin") return c.json({ message: "Forbidden" }, 403)

  const id = c.req.param("id")
  const { status } = await c.req.json()
  const allowed = ["pending", "in_progress", "completed", "cancelled"]

  if (!allowed.includes(status)) {
    return c.json({ message: `สถานะ '${status}' ไม่ถูกต้อง` }, 400)
  }

  const db = c.env.pre_wedding
  await db.prepare(`UPDATE bookings SET status = ? WHERE id = ?`).bind(status, id).run()

  if (status === "cancelled") {
    await db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      SELECT user_id, 'ยกเลิกการจองแล้ว',
             'การจองของคุณวันที่ ' || date || ' เวลา ' || time || ' ถูกยกเลิกโดยทีมงาน'
      FROM bookings WHERE id = ?
    `).bind(id).run()
  }

  if (status === "in_progress") {
    await db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      SELECT user_id, 'กำลังดำเนินการ',
             'การจองของคุณวันที่ ' || date || ' เวลา ' || time || ' กำลังดำเนินการอยู่'
      FROM bookings WHERE id = ?
    `).bind(id).run()
  }

  if (status === "completed") {
    await db.prepare(`
      INSERT INTO notifications (user_id, title, message)
      SELECT user_id, 'ดำเนินการเสร็จสิ้น',
             'การจองของคุณวันที่ ' || date || ' เวลา ' || time || ' เสร็จสิ้นแล้ว ขอบคุณที่ใช้บริการ'
      FROM bookings WHERE id = ?
    `).bind(id).run()
  }

  return c.json({ message: "อัปเดตสถานะสำเร็จ" })

})


/* =====================================================
   Admin อัปเดตสถานะการชำระเงิน
===================================================== */
booking.patch("/:id/payment", authMiddleware, async (c) => {

  const user = c.get("user")
  if (user.role !== "admin") return c.json({ message: "Forbidden" }, 403)

  const id = c.req.param("id")
  const { payment_status } = await c.req.json()
  const allowed = ["unpaid", "deposit", "paid"]

  if (!allowed.includes(payment_status)) {
    return c.json({ message: "สถานะการชำระเงินไม่ถูกต้อง" }, 400)
  }

  const db = c.env.pre_wedding
  await db.prepare(`UPDATE bookings SET payment_status = ? WHERE id = ?`).bind(payment_status, id).run()

  return c.json({ message: "อัปเดตการชำระเงินสำเร็จ" })

})


/* =====================================================
   Admin กำหนดแพ็คเกจ
===================================================== */
booking.patch("/:id/package", authMiddleware, async (c) => {

  const user = c.get("user")
  if (user.role !== "admin") return c.json({ message: "Forbidden" }, 403)

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
   Admin เลื่อนนัด
===================================================== */
booking.patch("/:id/reschedule", authMiddleware, async (c) => {

  const user = c.get("user")
  if (user.role !== "admin") return c.json({ message: "Forbidden" }, 403)

  const id = c.req.param("id")
  const { date, time } = await c.req.json()

  if (!date || !time) return c.json({ message: "กรอกข้อมูลไม่ครบ" }, 400)

  const db = c.env.pre_wedding

  const existing = await db
    .prepare(`SELECT id FROM bookings WHERE date = ? AND time = ? AND status != 'cancelled' AND id != ?`)
    .bind(date, time, id)
    .first()

  if (existing) return c.json({ message: "วันและเวลานี้ถูกจองแล้ว" }, 409)

  await db.prepare(`UPDATE bookings SET date = ?, time = ? WHERE id = ?`).bind(date, time, id).run()

  await db.prepare(`
    INSERT INTO notifications (user_id, title, message)
    SELECT user_id, 'เลื่อนนัดหมายแล้ว',
           'การจองของคุณถูกเลื่อนเป็นวันที่ ' || ? || ' เวลา ' || ?
    FROM bookings WHERE id = ?
  `).bind(date, time, id).run()

  return c.json({ message: "เลื่อนนัดสำเร็จ" })

})