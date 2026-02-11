import { Hono } from "hono"
import { auth } from "./routes/auth"

const app = new Hono()

app.route("/auth", auth)

export default app