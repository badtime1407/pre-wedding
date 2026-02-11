import { Hono } from "hono"
import { auth } from "./routes/auth"
import { admin } from "./routes/admin"
import { userRoute } from "./routes/user"

const app = new Hono()

app.route("/auth", auth)
app.route("/admin", admin)
app.route("/user", userRoute)

export default app