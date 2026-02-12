import { Hono } from "hono"
import { authMiddleware } from "../middleware/authMiddleware"

export const userRoute = new Hono()

userRoute.use("*", authMiddleware)


userRoute.get("/home", (c) => {
  return c.json({
    message: "Welcome User Home"
  })
})