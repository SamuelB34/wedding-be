import routes from "./routes"
import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import path from "path"
const cors = require("cors")

const app = express()
dotenv.config()

app.use(express.static(__dirname + "/public"))

app.use(
	bodyParser.json({
		limit: "20mb",
	}),
	cors({
		origin: "https://www.sammel-wedding.com/",
	})
)

// Routes
app.use("/api", routes)

export default app
