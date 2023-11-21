import express from "express"
import TablesController from "../controllers/tables/tables.controller"
import { dtoValidation } from "../middlewares/dto-validation"
import { CreateTableDto } from "../controllers/tables/dtos/create-table.dto"
import { UpdateTableDto } from "../controllers/tables/dtos/update-table.dto"
import { authLoggedUser } from "../common/auth/authLoggedUser"

const router = express.Router()

router.get("/", authLoggedUser, TablesController.getAll)
router.get("/:id", authLoggedUser, TablesController.getById)

router.post(
	"/",
	authLoggedUser,
	dtoValidation(CreateTableDto),
	TablesController.create
)

router.put(
	"/:id",
	authLoggedUser,
	dtoValidation(UpdateTableDto),
	TablesController.update
)

router.delete("/:id", authLoggedUser, TablesController.delete)

export default router
