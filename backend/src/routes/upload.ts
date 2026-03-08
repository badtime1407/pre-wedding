import { Hono } from "hono"
import { authMiddleware } from "../middleware/authMiddleware"

export const uploadRoute = new Hono()

const R2_PUBLIC_URL = "https://pub-d37f5425ad37417b817b784fe79d5b9f.r2.dev"

/* =====================================================
   Upload รูปภาพขึ้น R2
===================================================== */
uploadRoute.post("/", authMiddleware, async (c) => {

  const user = c.get("user")
  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const formData = await c.req.formData()
  const file = formData.get("file")

  if (!file || typeof file === "string") {
    return c.json({ message: "ไม่พบไฟล์" }, 400)
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return c.json({ message: "รองรับเฉพาะ JPG, PNG, WEBP, GIF" }, 400)
  }

  const ext      = file.name.split(".").pop()
  const filename = `packages/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const buffer = await file.arrayBuffer()

  await c.env.prewedding.put(filename, buffer, {
    httpMetadata: { contentType: file.type },
  })

  const url = `${R2_PUBLIC_URL}/${filename}`

  return c.json({ url })

})