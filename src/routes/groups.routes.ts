import express from "express"
import GroupsController from "../controllers/groups/groups.controller"
import { CreateGroupDto } from "../controllers/groups/dtos/create-group.dto"
import { dtoValidation } from "../middlewares/dto-validation"
import { UpdateGroupDto } from "../controllers/groups/dtos/update-group.dto"

const router = express.Router()

router.get("/", GroupsController.getAll)
router.get("/:id", GroupsController.getById)

router.post("/", dtoValidation(CreateGroupDto), GroupsController.create)

router.put("/:id", dtoValidation(UpdateGroupDto), GroupsController.update)

router.delete("/:id", GroupsController.delete)

export default router
