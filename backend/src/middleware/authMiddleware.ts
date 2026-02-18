import { verifyToken } from "../utils/jwt"

export async function authMiddleware(c: any, next: any) {
  const authHeader = c.req.header("Authorization")

  if (!authHeader) {
    return c.json({ message: "Unauthorized" }, 401)
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = verifyToken(token, c.env.JWT_SECRET)
    c.set("user", decoded)
    await next()
  } catch {
    return c.json({ message: "Invalid token" }, 401)
  }
}