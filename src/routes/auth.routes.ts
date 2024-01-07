import express from "express"
import { dtoValidation } from "../middlewares/dto-validation"
import AuthController from "../controllers/auth/auth.controller"

const router = express.Router()

router.post("/", AuthController.login)

export default router
