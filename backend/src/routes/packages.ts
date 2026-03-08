import { Hono } from "hono"
import { authMiddleware } from "../middleware/authMiddleware"

export const packagesRoute = new Hono()

const R2_PUBLIC_URL = "https://pub-d37f5425ad37417b817b784fe79d5b9f.r2.dev"

/* ============================= */
/* GET ALL PACKAGES              */
/* ============================= */
packagesRoute.get("/", async (c) => {
  const db = c.env.pre_wedding

  const result = await db
    .prepare("SELECT * FROM packages ORDER BY created_at DESC")
    .all()

  return c.json(result.results)
})

/* ============================= */
/* GET PACKAGE BY TYPE           */
/* ============================= */
packagesRoute.get("/type/:type", async (c) => {
  const type = c.req.param("type")
  const db = c.env.pre_wedding

  const result = await db
    .prepare("SELECT * FROM packages WHERE type = ? ORDER BY created_at DESC")
    .bind(type)
    .all()

  return c.json(result.results)
})

/* ============================= */
/* UPLOAD IMAGE TO R2            */
/* ============================= */
packagesRoute.post("/upload", authMiddleware, async (c) => {
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
  const buffer   = await file.arrayBuffer()

  await c.env.prewedding.put(filename, buffer, {
    httpMetadata: { contentType: file.type },
  })

  return c.json({ url: `${R2_PUBLIC_URL}/${filename}` })
})

/* ============================= */
/* GET PACKAGE BY ID             */
/* ============================= */
packagesRoute.get("/:id", async (c) => {
  const id = c.req.param("id")
  const db = c.env.pre_wedding

  const result = await db
    .prepare("SELECT * FROM packages WHERE id = ?")
    .bind(id)
    .first()

  if (!result) {
    return c.json({ message: "Package not found" }, 404)
  }

  return c.json(result)
})

/* ============================= */
/* CREATE PACKAGE (ADMIN ONLY)   */
/* ============================= */
packagesRoute.post("/", authMiddleware, async (c) => {
  const user = c.get("user")

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const { name, description, price, image_url, type, sale_price, sale_start, sale_end } = await c.req.json()
  const db = c.env.pre_wedding

  await db
    .prepare(
      "INSERT INTO packages (name, description, price, image_url, type, sale_price, sale_start, sale_end) VALUES (?,?,?,?,?,?,?,?)"
    )
    .bind(name, description, price, image_url, type, sale_price ?? null, sale_start ?? null, sale_end ?? null)
    .run()

  return c.json({ message: "Package created successfully" })
})

/* ============================= */
/* UPDATE PACKAGE (ADMIN ONLY)   */
/* ============================= */
packagesRoute.put("/:id", authMiddleware, async (c) => {
  const user = c.get("user")

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const id = c.req.param("id")
  const { name, description, price, image_url, type, sale_price, sale_start, sale_end } = await c.req.json()
  const db = c.env.pre_wedding

  await db
    .prepare(
      `UPDATE packages 
       SET name=?, description=?, price=?, image_url=?, type=?,
           sale_price=?, sale_start=?, sale_end=?,
           updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`
    )
    .bind(name, description, price, image_url, type, sale_price ?? null, sale_start ?? null, sale_end ?? null, id)
    .run()

  return c.json({ message: "Package updated successfully" })
})

/* ============================= */
/* DELETE PACKAGE (ADMIN ONLY)   */
/* ============================= */
packagesRoute.delete("/:id", authMiddleware, async (c) => {
  const user = c.get("user")

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  const id = c.req.param("id")
  const db = c.env.pre_wedding

  await db
    .prepare("DELETE FROM packages WHERE id=?")
    .bind(id)
    .run()

  return c.json({ message: "Package deleted successfully" })
})