import guests, { GuestType } from "../../models/guests"
import { BaseController } from "../base.controller"
import { Request, Response, NextFunction } from "express"
import { CreateGuestDto } from "./dtos/create-guest.dto"
import { formatDate } from "../../middlewares/format"
import { UpdateGuestDto } from "./dtos/update-guest.dto"
import mongoose from "mongoose"
import { respondUnauthorized } from "../../common/auth/common"

class GuestsController extends BaseController {
	public getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const docs = await guests.find({ deleted_at: { $exists: false } })
			return this.respondSuccess(res, `Success`, docs)
		} catch (err) {
			next(err)
		}
	}

	public getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id

			// Check if the ID is valid
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const guest = await guests.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!guest.length) return this.respondInvalid(res, `Guest not found`)

			return this.respondSuccess(res, `Success`, guest)
		} catch (err) {
			next(err)
		}
	}

	public create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const body = req.body as CreateGuestDto
			// @ts-ignore
			const user = req.user

			const email: string = body.email_address
			const phone: string = body.phone_number

			if (user?.role === "wedding-planner") {
				return respondUnauthorized(res)
			}

			// Check if email is repeated
			const email_repeated = await guests.find({
				email_address: email,
				deleted_at: { $exists: false },
			})
			if (email_repeated.length)
				return this.respondInvalid(res, `Email Address Repeated`)

			// Check if phone number is repeated
			const phone_repeated = await guests.find({ phone_number: phone })
			if (phone_repeated.length)
				return this.respondInvalid(res, `Phone Number Repeated`)

			let data = {
				...body,
				created_at: formatDate(Date.now()),
				created_by: user?.id,
			}

			const newGuest = await guests.create(data)
			if (!newGuest) return this.respondServerError(res)

			return this.respondSuccess(res, `Success`, newGuest)
		} catch (err) {
			next(err)
		}
	}

	public update = async (req: Request, res: Response) => {
		try {
			const body = req.body as UpdateGuestDto
			const id = req.params.id
			// @ts-ignore
			const user = req.user

			// Check if the ID is valid
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const find_id = await guests.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!find_id) return this.respondInvalid(res, `Guest not found`)

			const guest_id = find_id[0].created_by

			if (user?.role !== "admin" && guest_id !== user?.id)
				return this.respondInvalid(
					res,
					`Only admins and the one created the guest can update it`
				)

			const data = {
				...body,
				updated_by: user.id,
				updated_at: formatDate(Date.now()),
			}

			const guest = await guests.findByIdAndUpdate(id, data)

			if (!guest) return this.respondInvalid(res, `Guest not found`)

			return this.respondSuccess(res, `Success`, body)
		} catch (e) {
			return this.respondServerError(res)
		}
	}

	public delete = async (req: Request, res: Response) => {
		try {
			const id = req.params.id
			// @ts-ignore
			const user = req.user!

			// Check if the ID is valid
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const find_id = await guests.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!find_id) return this.respondInvalid(res, `Guest not found`)

			if (user.role !== "admin" && user.id !== id)
				return this.respondInvalid(
					res,
					`Only admins and the one created the guest can update it`
				)

			const guest = await guests.findByIdAndUpdate(id, {
				deleted_at: formatDate(Date.now()),
				deleted_by: user.id,
			})

			if (!guest) return this.respondInvalid(res, `Guest not found`)

			return this.respondSuccess(
				res,
				`Success`,
				` Record deleted: ${id} 💥💥💥`
			)
		} catch (e) {}
	}

	public sawInvitation = async (req: Request, res: Response) => {
		try {
			const saw_invitation = await guests.countDocuments({
				saw_invitation: true,
				deleted_at: { $exists: false },
			})

			const total = await guests.countDocuments({
				deleted_at: { $exists: false },
			})

			const data = {
				count: saw_invitation,
				total: total,
			}
			return this.respondSuccess(res, `Success`, data)
		} catch (e) {}
	}

	public assist = async (req: Request, res: Response) => {
		try {
			const assist = await guests.countDocuments({
				assist: true,
				deleted_at: { $exists: false },
			})

			const total = await guests.countDocuments({
				deleted_at: { $exists: false },
			})

			const data = {
				count: assist,
				total: total,
			}
			return this.respondSuccess(res, `Success`, data)
		} catch (e) {}
	}

	public totalCount = async (req: Request, res: Response) => {
		try {
			const docs = await guests.countDocuments({
				deleted_at: { $exists: false },
			})
			return this.respondSuccess(res, `Success`, docs)
		} catch (e) {}
	}
}

export default new GuestsController()
