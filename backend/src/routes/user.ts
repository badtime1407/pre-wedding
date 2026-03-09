import { Hono } from "hono"
import { authMiddleware } from "../middleware/authMiddleware"

export const userRoute = new Hono()

userRoute.use("*", authMiddleware)

const R2_PUBLIC_URL = "https://pub-d37f5425ad37417b817b784fe79d5b9f.r2.dev"

userRoute.get("/home", (c) => {
  return c.json({ message: "Welcome User Home" })
})

/* =====================================================
   GET profile ของตัวเอง
===================================================== */
userRoute.get("/me", async (c) => {
  const user = c.get("user")
  const db = c.env.pre_wedding

  const result = await db
    .prepare("SELECT id, name, email, role, avatar FROM users WHERE id = ?")
    .bind(user.id)
    .first()

  if (!result) return c.json({ message: "User not found" }, 404)

  return c.json(result)
})

/* =====================================================
   อัปโหลด avatar ไป R2
===================================================== */
userRoute.post("/avatar", async (c) => {
  const user = c.get("user")
  const db = c.env.pre_wedding

  const formData = await c.req.formData()
  const file = formData.get("file")

  if (!file || typeof file === "string") {
    return c.json({ message: "ไม่พบไฟล์" }, 400)
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return c.json({ message: "รองรับเฉพาะ JPG, PNG, WEBP" }, 400)
  }

  const ext      = file.name.split(".").pop()
  const filename = `avatars/${user.id}-${Date.now()}.${ext}`
  const buffer   = await file.arrayBuffer()

  await c.env.prewedding.put(filename, buffer, {
    httpMetadata: { contentType: file.type },
  })

  const avatarUrl = `${R2_PUBLIC_URL}/${filename}`

  await db
    .prepare("UPDATE users SET avatar = ? WHERE id = ?")
    .bind(avatarUrl, user.id)
    .run()

  return c.json({ avatar: avatarUrl })
})