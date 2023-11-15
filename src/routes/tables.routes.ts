import express from "express"
import TablesController from "../controllers/tables/tables.controller"
import { dtoValidation } from "../middlewares/dto-validation"
import { CreateTableDto } from "../controllers/tables/dtos/create-table.dto"

const router = express.Router()

router.get("/", TablesController.getAll)
router.get("/:id", TablesController.getById)

router.post("/", dtoValidation(CreateTableDto), TablesController.create)

export default router
