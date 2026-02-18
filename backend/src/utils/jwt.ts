import jwt, { JwtPayload } from "jsonwebtoken"

export function generateToken(
  payload: { id: number; role: string },
  secret: string
): string {
  if (!secret) {
    throw new Error("JWT secret is not defined")
  }

  return jwt.sign(payload, secret, {
    expiresIn: "1d", // token อายุ 1 วัน
  })
}

export function verifyToken(
  token: string,
  secret: string
): JwtPayload & { id: number; role: string } {
  if (!secret) {
    throw new Error("JWT secret is not defined")
  }

  const decoded = jwt.verify(token, secret)

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload")
  }

  return decoded as JwtPayload & { id: number; role: string }
}
