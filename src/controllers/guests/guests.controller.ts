import guests, { GuestType } from "../../models/guests"
import { BaseController } from "../base.controller"
import { Request, Response, NextFunction } from "express"
import { CreateGuestDto } from "./dtos/create-guest.dto"
import { formatDate } from "../../middlewares/format"
import { UpdateGuestDto } from "./dtos/update-guest.dto"
import mongoose from "mongoose"
import { respondUnauthorized } from "../../common/auth/common"
import users from "../../models/users"
import { findFormat } from "./find_format"
import groups from "../../models/groups"

// const accountSid = process.env.TWILIO_ACCOUNT_SID
// const authToken = process.env.TWILIO_AUTH_TOKEN
// const client = require("twilio")(accountSid, authToken)

class GuestsController extends BaseController {
	public getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const query_params: any = req.query

			const skipRecords = (+query_params.p - 1) * +query_params.pp
			const filter = query_params.filter
			let filter_users = []

			const docs: any = await guests
				.find(findFormat(query_params))
				.skip(+skipRecords)
				.limit(+query_params.pp || 30)
				.sort({ created_at: -1 })

			let data: any[] = []

			if (docs.length) {
				for (const doc of docs) {
					const user = await users.find({
						_id: doc.created_by,
						deleted_at: { $exists: false },
					})

					if (!user.length) return this.respondInvalid(res, `User not found`)

					if (doc["_doc"].group.length) {
						const group = await groups.find({
							_id: doc.group,
							deleted_at: { $exists: false },
						})

						if (!group.length) return this.respondInvalid(res, `User not found`)

						data.push({
							...doc["_doc"],
							_id: doc["_doc"]._id,
							group: group[0].name,
							created_by: {
								_id: doc.created_by,
								username: user[0].username,
							},
						})
					} else {
						data.push({
							...doc["_doc"],
							_id: doc["_doc"]._id,
							created_by: {
								_id: doc.created_by,
								username: user[0].username,
							},
						})
					}
				}
			} else {
				data = docs
			}

			return this.respondSuccess(res, `Success`, data)
		} catch (err) {
			next(err)
		}
	}

	public totalCount = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const query_params: any = req.query
			const docs = await guests.countDocuments(findFormat(query_params))
			return this.respondSuccess(res, `Success`, { total_count: docs })
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
			const user = req.user!

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
				full_name: body.middle_name
					? `${body.first_name} ${body.middle_name} ${body.last_name}`
					: `${body.first_name} ${body.last_name}`,
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
				full_name: body.middle_name
					? `${body.first_name} ${body.middle_name} ${body.last_name}`
					: `${body.first_name} ${body.last_name}`,
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

			if (user.role !== "admin" && user.id !== find_id[0]["created_by"])
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

	// public sendWhatsApp = async (req: Request, res: Response) => {
	// 	try {
	// 		client.messages
	// 			.create({
	// 				from: "whatsapp:+5216865782380",
	// 				body: "Hola ama",
	// 				to: "whatsapp:+5216865424276",
	// 				messagingServiceSid: "MG3e00207234c353ff06bd2711ca7c611a",
	// 			})
	// 			.then((message: any) => {
	// 				console.log("💥💥💥💥💥💥 HOLAA 💥💥💥💥💥💥", message)
	// 				return this.respondSuccess(res, `Success`, message)
	// 			})
	// 	} catch (e) {
	// 		return this.respondServerError(res)
	// 	}
	// }

	// public formatNames = async (
	// 	req: Request,
	// 	res: Response,
	// 	next: NextFunction
	// ) => {
	// 	try {
	// 		const docs: any = await guests.find({ deleted_at: { $exists: false } })
	//
	// 		if (docs.length) {
	// 			for (const doc of docs) {
	// 				const id = doc._id.toString()
	// 				const x = await guests.findByIdAndUpdate(id, {
	// 					$set: {
	// 						full_name: doc.middle_name
	// 							? `${doc.first_name} ${doc.middle_name} ${doc.last_name}`
	// 							: `${doc.first_name} ${doc.last_name}`,
	// 					},
	// 				})
	// 			}
	// 		}
	//
	// 		return this.respondSuccess(res, `Success`, {})
	// 	} catch (err) {
	// 		next(err)
	// 		console.log("HOLA")
	// 	}
	// }
}

export default new GuestsController()
