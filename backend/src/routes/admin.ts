import { Hono } from "hono"
import { verifyToken } from "../middleware/authMiddleware"

export const admin = new Hono()

admin.use("*", verifyToken)

admin.get("/dashboard", (c) => {
  const user = c.get("user") as any

  if (user.role !== "admin") {
    return c.json({ message: "Forbidden" }, 403)
  }

  return c.json({
    message: "Welcome Admin Dashboard"
  })
})
