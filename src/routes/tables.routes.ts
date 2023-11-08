import express from "express"
import TablesController from "../controllers/tables/tables.controller"

const router = express.Router()

router.get("/", TablesController.getAll)
router.get("/:id", TablesController.getById)

export default router
