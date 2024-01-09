import routes from "./routes"
import express from "express"
import bodyParser from "body-parser"
const cors = require("cors")

const app = express()

app.use(cors({ origin: "*" }))

app.use(
	bodyParser.json({
		limit: "20mb",
	})
)

// Routes
app.use("/api", routes)

export default app
