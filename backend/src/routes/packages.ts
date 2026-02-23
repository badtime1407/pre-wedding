import { Hono } from "hono"
import { authMiddleware } from "../middleware/authMiddleware"

export const packagesRoute = new Hono()

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

  const { name, description, price, image_url, type } = await c.req.json()
  const db = c.env.pre_wedding

  await db
    .prepare(
      "INSERT INTO packages (name, description, price, image_url, type) VALUES (?,?,?,?,?)"
    )
    .bind(name, description, price, image_url, type)
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
  const { name, description, price, image_url, type } = await c.req.json()
  const db = c.env.pre_wedding

  await db
    .prepare(
      `UPDATE packages 
       SET name=?, description=?, price=?, image_url=?, type=?, updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`
    )
    .bind(name, description, price, image_url, type, id)
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
