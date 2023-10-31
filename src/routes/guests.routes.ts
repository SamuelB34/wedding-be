import express from "express"
import GuestsController from "../controllers/guests/guests.controller"
import { CreateGuestDto } from "../controllers/guests/dtos/create-guest.dto"
import { dtoValidation } from "../middlewares/dto-validation"

const router = express.Router()

router.get("/", GuestsController.getAll)
router.post("/", dtoValidation(CreateGuestDto), GuestsController.create)

export default router
