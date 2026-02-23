import { Hono } from "hono"
import { hashPassword, comparePassword } from "../utils/hash"
import { generateToken } from "../utils/jwt"

export const auth = new Hono()

auth.post("/register", async (c) => {
  const { name, email, password } = await c.req.json()

  const db = c.env.pre_wedding

  const existing = await db
    .prepare("SELECT id FROM users WHERE email = ?")
    .bind(email)
    .first()

  if (existing) {
    return c.json({ message: "Email exists" }, 409)
  }

  const hashed = await hashPassword(password)

  await db
    .prepare(
      "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)"
    )
    .bind(name, email, hashed, "user")
    .run()

  return c.json({ message: "Registered" })
})

auth.post("/login", async (c) => {
  const { identifier, password } = await c.req.json()
  const db = c.env.pre_wedding

  const user = await db
    .prepare(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)"
    )
    .bind(identifier, identifier)
    .first()

  if (!user)
    return c.json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401)

  const isValid = await comparePassword(password, user.password)

  if (!isValid)
    return c.json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401)

  // ✅ ดึง secret จาก environment
  const secret = c.env.JWT_SECRET

  const token = generateToken(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    secret
  )

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  })
})

auth.post("/reset-password", async (c) => {
  try {
    const { identifier, newPassword } = await c.req.json()

    if (!identifier || !newPassword) {
      return c.json({ message: "Missing fields" }, 400)
    }

    if (newPassword.length < 6) {
      return c.json(
        { message: "Password must be at least 6 characters" },
        400
      )
    }

    const db = c.env.pre_wedding

    const user = await db
      .prepare(
        "SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)"
      )
      .bind(identifier, identifier)
      .first()

    if (!user) {
      return c.json({ message: "User not found" }, 404)
    }

    const hashed = await hashPassword(newPassword)

    await db
      .prepare("UPDATE users SET password = ? WHERE id = ?")
      .bind(hashed, user.id)
      .run()

    return c.json({ message: "Password reset successfully" })

  } catch (err) {
    console.error(err)
    return c.json({ message: "Server error" }, 500)
  }
})