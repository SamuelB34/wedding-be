import express from "express"
import { dtoValidation } from "../middlewares/dto-validation"
import UsersController from "../controllers/users/users.controller"
import { CreateUserDto } from "../controllers/users/dtos/create-user.dto"
import { authLoggedUser } from "../common/auth/authLoggedUser"

const router = express.Router()

router.get("/:id", authLoggedUser, UsersController.getById)

router.post("/", UsersController.create)

router.delete("/:id", UsersController.delete)

export default router
