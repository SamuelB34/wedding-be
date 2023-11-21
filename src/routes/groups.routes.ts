import express from "express"
import GroupsController from "../controllers/groups/groups.controller"
import { CreateGroupDto } from "../controllers/groups/dtos/create-group.dto"
import { dtoValidation } from "../middlewares/dto-validation"
import { UpdateGroupDto } from "../controllers/groups/dtos/update-group.dto"
import { authLoggedUser } from "../common/auth/authLoggedUser"

const router = express.Router()

router.get("/", authLoggedUser, GroupsController.getAll)
router.get("/:id", authLoggedUser, GroupsController.getById)

router.post(
	"/",
	authLoggedUser,
	dtoValidation(CreateGroupDto),
	GroupsController.create
)

router.put(
	"/:id",
	authLoggedUser,
	dtoValidation(UpdateGroupDto),
	GroupsController.update
)

router.delete("/:id", authLoggedUser, GroupsController.delete)

export default router
