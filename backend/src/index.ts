import { Hono } from "hono"
import { cors } from "hono/cors"
import { auth } from "./routes/auth"
import { admin } from "./routes/admin"
import { userRoute } from "./routes/user"
import { packagesRoute } from "./routes/packages"
import { booking } from "./routes/booking"


const app = new Hono()

app.use("*", cors({
  origin: ["http://localhost:5173", "https://fancy-moon-c6d2.patipan.workers.dev"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"]
}))

app.route("/auth", auth)
app.route("/admin", admin)
app.route("/user", userRoute)
app.route("/packages", packagesRoute)
app.route("/bookings", booking)

export default app