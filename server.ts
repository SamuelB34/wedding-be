import dotenv from "dotenv"
import db from "./src/database/db"
import app from "./src/app"

//For env File
dotenv.config()

const port = process.env.PORT || 8000
const host = process.env.SERVER_HOST ?? "0.0.0.0"

app.listen(port, () => {
	console.log(`🚀🚀🚀 Server running at ${host}:${port} 🚀🚀🚀`)
})

db.connect()
