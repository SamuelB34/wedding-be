import routes from "./routes"
import express from "express"
import bodyParser from "body-parser"

const app = express()

app.use(
	bodyParser.json({
		limit: "20mb",
	})
)

// Routes
app.use(routes)

export default app
