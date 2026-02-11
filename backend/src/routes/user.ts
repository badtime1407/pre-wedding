import { Hono } from "hono"
import { verifyToken } from "../middleware/authMiddleware"

export const userRoute = new Hono()

userRoute.use("*", verifyToken)

userRoute.get("/home", (c) => {
  return c.json({
    message: "Welcome User Home"
  })
})