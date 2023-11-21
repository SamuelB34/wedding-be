import routes from "./routes"
import express from "express"
import bodyParser from "body-parser"
const cors = require("cors")

const app = express()

app.use(
	bodyParser.json({
		limit: "20mb",
	}),
	cors({
		origin: "http://localhost:3000",
	})
)

// Routes
app.use(routes)

export default app
