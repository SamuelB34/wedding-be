import express from "express"
import GuestsController from "../controllers/guests/guests.controller"
import { CreateGuestDto } from "../controllers/guests/dtos/create-guest.dto"
import { dtoValidation } from "../middlewares/dto-validation"
import { UpdateGuestDto } from "../controllers/guests/dtos/update-guest.dto"

const router = express.Router()

router.get("/", GuestsController.getAll)
router.post("/", dtoValidation(CreateGuestDto), GuestsController.create)
router.put("/:id", dtoValidation(UpdateGuestDto), GuestsController.update)
router.delete("/:id", GuestsController.delete)

export default router
