import express from "express"
import GroupsController from "../controllers/groups/groups.controller"
import { authLoggedUser } from "../common/auth/authLoggedUser"

const router = express.Router()

router.get("/", authLoggedUser, GroupsController.getAll)

router.get("/total-count", authLoggedUser, GroupsController.totalCount)

router.get("/:id", authLoggedUser, GroupsController.getById)

router.post("/", authLoggedUser, GroupsController.create)

router.put("/:id", authLoggedUser, GroupsController.update)

router.delete("/:id", authLoggedUser, GroupsController.delete)

export default router
