import express from "express"
import { dtoValidation } from "../middlewares/dto-validation"
import { LoginDto } from "../controllers/auth/dtos/login.dto"
import AuthController from "../controllers/auth/auth.controller"

const router = express.Router()

router.post("/", dtoValidation(LoginDto), AuthController.login)

export default router
