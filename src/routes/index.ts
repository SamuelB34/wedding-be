import express from "express"
import AuthRoutes from "./auth.routes"
import GuestsRoutes from "./guests.routes"
import GroupsRoutes from "./groups.routes"
import TablesRoutes from "./tables.routes"
import UsersRoutes from "./users.routes"

const router = express.Router()

router.use("/auth", AuthRoutes)
router.use("/users", UsersRoutes)
router.use("/guests", GuestsRoutes)
router.use("/groups", GroupsRoutes)
router.use("/tables", TablesRoutes)

export default router
