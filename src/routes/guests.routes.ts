import express from "express"
import GuestsController from "../controllers/guests/guests.controller"
import { CreateGuestDto } from "../controllers/guests/dtos/create-guest.dto"
import { dtoValidation } from "../middlewares/dto-validation"
import { UpdateGuestDto } from "../controllers/guests/dtos/update-guest.dto"
import { authLoggedUser } from "../common/auth/authLoggedUser"
import { authPermissions } from "../common/auth/authPermissions"

const router = express.Router()

router.get("/", authLoggedUser, GuestsController.getAll)
router.get("/total-count", authLoggedUser, GuestsController.totalCount)
router.get("/saw-invitation", authLoggedUser, GuestsController.sawInvitation)
router.get("/assist", authLoggedUser, GuestsController.assist)
router.get("/:id", authLoggedUser, GuestsController.getById)

router.post(
	"/",
	authLoggedUser,
	dtoValidation(CreateGuestDto),
	GuestsController.create
)

router.put(
	"/:id",
	authLoggedUser,
	dtoValidation(UpdateGuestDto),
	GuestsController.update
)

router.delete("/:id", authLoggedUser, GuestsController.delete)

export default router
