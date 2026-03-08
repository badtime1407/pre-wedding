import { Hono } from "hono"
import { cors } from "hono/cors"
import { auth } from "./routes/auth"
import { admin } from "./routes/admin"
import { userRoute } from "./routes/user"
import { packagesRoute } from "./routes/packages"
import { booking } from "./routes/booking"
import { uploadRoute } from "./routes/upload"


const app = new Hono()

app.use("*", cors({
  origin: ['http://localhost:5173', 'https://pre-wedding.pages.dev' ,'https://pre-wedding-delta.vercel.app'],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"]
}))

app.get("/", (c) => {
  return c.text("Pre-wedding running 🚀")
})

app.route("/auth", auth)
app.route("/admin", admin)
app.route("/user", userRoute)
app.route("/packages", packagesRoute)
app.route("/bookings", booking)
app.route("/upload", uploadRoute)

export default app