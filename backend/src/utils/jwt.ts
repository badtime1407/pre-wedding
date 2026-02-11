import jwt from "jsonwebtoken"

const SECRET = "super_secret_key_change_this"

export function generateToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: "1d" })
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET)
}