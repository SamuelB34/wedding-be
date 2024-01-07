import dotenv from "dotenv"
import db from "./src/database/db"
import app from "./src/app"
import * as path from "path"

//For env File
dotenv.config({ path: path.join(__dirname, ".env") })

const port = process.env.PORT || 8000
const host = process.env.SERVER_HOST ?? "0.0.0.0"

app.listen(port, () => {
	console.log(`🚀🚀🚀 Server running at ${host}:${port} 🚀🚀🚀`)
})

db.connect()
