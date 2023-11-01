import guests from "../../models/guests"
import { BaseController } from "../base.controller"
import { NextFunction, Request, Response } from "express"
import { CreateGuestDto } from "./dtos/create-guest.dto"
import { formatDate } from "../../middlewares/format"

class GuestsController extends BaseController {
	public getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const docs = await guests.find({})
			return this.respondSuccess(res, `Success`, docs)
		} catch (err) {
			next(err)
		}
	}

	public create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			let data = req.body as CreateGuestDto
			data = {
				...data,
				created_at: formatDate(Date.now()),
				created_by: "Admin",
			}
			const email = data.email_address
			const phone = data.phone_number

			// Check if email is repeated
			const repeated_email = await guests.find({ email_address: email })
			if (repeated_email.length)
				return this.respondInvalid(res, `Email Address Repeated`)

			// Check if phone number is repeated
			const phone_repeated = await guests.find({ phone_number: phone })
			if (phone_repeated.length)
				return this.respondInvalid(res, `Phone Number Repeated`)

			const newGuest = await guests.create(data)
			if (!newGuest) return this.respondServerError(res)

			return this.respondSuccess(res, `Success`, newGuest)
		} catch (err) {
			next(err)
		}
	}
}

export default new GuestsController()
