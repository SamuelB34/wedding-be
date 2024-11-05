import guests, { GuestType } from "../../models/guests"
import { BaseController } from "../base.controller"
import { Request, Response, NextFunction } from "express"
import { CreateGuestDto } from "./dtos/create-guest.dto"
import { formatDate } from "../../middlewares/format"
import { UpdateAnswerGuestDto, UpdateGuestDto } from "./dtos/update-guest.dto"
import mongoose from "mongoose"
import { respondUnauthorized } from "../../common/auth/common"
import users from "../../models/users"
import { findFormat, findFormatGroups } from "./find_format"
import groups from "../../models/groups"
import tables from "../../models/tables"

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
			const sortBy = query_params.sort_by || "created_at" // Campo por defecto si no se envía sort_by
			const sortOrder = query_params.sort_order === "asc" ? 1 : -1 // Orden ascendente si sort_order es 'asc', descendente por defecto

			const docs: any = await guests
				.find(findFormat(query_params))
				.skip(+skipRecords)
				.limit(+query_params.pp || 30)
				.sort({ [sortBy]: sortOrder }) // Usar el nombre del campo y el orden dinámicamente

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

						if (doc["_doc"].table.length) {
							const table = await tables.find({
								_id: doc.table,
								deleted_at: { $exists: false },
							})

							if (!table.length)
								return this.respondInvalid(res, `Table not found`)

							data.push({
								...doc["_doc"],
								_id: doc["_doc"]._id,
								group: group[0].name,
								table: table[0].number,
								created_by: {
									_id: doc.created_by,
									username: user[0].username,
								},
							})
						} else {
							data.push({
								...doc["_doc"],
								_id: doc["_doc"]._id,
								group: group[0].name,
								created_by: {
									_id: doc.created_by,
									username: user[0].username,
								},
							})
						}
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

			const guest: any = await guests.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!guest.length) return this.respondInvalid(res, `Guest not found`)

			let data

			if (guest[0]["_doc"].group.length) {
				const group = await groups.find({
					_id: guest[0].group,
					deleted_at: { $exists: false },
				})

				if (!group.length) return this.respondInvalid(res, `User not found`)

				data = {
					...guest[0]["_doc"],
					group: { label: group[0].name, value: group[0]._id },
				}
			} else {
				data = guest[0]["_doc"]
			}

			return this.respondSuccess(res, `Success`, data)
		} catch (err) {
			next(err)
		}
	}

	public getSingleById = async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		try {
			const id = req.params.id

			// Check if the ID is valid
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const guest: any = await guests.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!guest.length) return this.respondInvalid(res, `Guest not found`)

			return this.respondSuccess(res, `Success`, {
				first_name: guest[0]["_doc"].first_name,
				saw_invitation: guest[0]["_doc"].saw_invitation,
				answered: guest[0]["_doc"].answer,
				assist: guest[0]["_doc"].assist,
			})
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
			const newGuest: any = await guests.create(data)
			if (!newGuest) return this.respondServerError(res)

			if (body.group) {
				if (!mongoose.Types.ObjectId.isValid(body.group)) {
					return this.respondInvalid(res, `Invalid Group ID`)
				}
				const group = await groups.find({
					_id: body.group,
					deleted_at: { $exists: false },
				})

				if (!group.length) return this.respondInvalid(res, `Group not found`)

				const guests_of_group = group[0].guests.map((guest_id) => {
					return guest_id.toString()
				})
				guests_of_group.push(newGuest["_id"].toString())

				const updateGroup = await groups.findByIdAndUpdate(body.group, {
					guests: guests_of_group,
				})
				if (!updateGroup)
					return this.respondInvalid(
						res,
						`User created, but issue assigning the group`
					)
			}

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

			if (data.group) {
				if (
					find_id[0].group?.length &&
					find_id[0].group[0].toString() !== data.group
				) {
					const group = await groups.findById(data.group)

					if (!group) return this.respondInvalid(res, `Group not found`)

					const prev_group = await groups.findById(find_id[0].group[0])

					if (!prev_group)
						return this.respondInvalid(res, `Previous group not found`)

					const prev_guests_list = prev_group["guests"].map((guest_id) => {
						return guest_id.toString()
					})

					const guests_list = group["guests"].map((guest_id) => {
						return guest_id.toString()
					})

					guests_list.push(id)

					const index = prev_guests_list.findIndex((value) => {
						return value === id
					})

					console.log(index)

					prev_guests_list.splice(index, 1)

					const updated_group = await groups.findByIdAndUpdate(data.group, {
						guests: guests_list,
					})

					const updated_prev_group = await groups.findByIdAndUpdate(
						find_id[0].group[0].toString(),
						{
							guests: prev_guests_list,
						}
					)

					if (!updated_prev_group)
						return this.respondInvalid(res, `Error updating previous group`)

					if (!updated_group)
						return this.respondInvalid(res, `Error updating group`)
				} else if (!find_id[0].group?.length) {
					const group = await groups.findById(data.group)

					if (!group) return this.respondInvalid(res, `Group not found`)

					const guests_list = group["guests"].map((guest_id) => {
						return guest_id.toString()
					})
					guests_list.push(id)

					const updated_group = await groups.findByIdAndUpdate(data.group, {
						guests: guests_list,
					})

					if (!updated_group)
						return this.respondInvalid(res, `Error updating group`)
				}
			}

			const guest = await guests.findByIdAndUpdate(id, data)

			if (!guest) return this.respondInvalid(res, `Guest not found`)

			return this.respondSuccess(res, `Success`, body)
		} catch (e) {
			return this.respondServerError(res)
		}
	}

	public updateAssist = async (req: Request, res: Response) => {
		try {
			const id = req.params.id
			const body = req.body as UpdateAnswerGuestDto

			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const guest = await guests.findByIdAndUpdate(id, {
				answer: true,
				assist: body.assist,
			})

			if (!guest) return this.respondInvalid(res, `Guest not found`)

			return this.respondSuccess(res, `Success`, guest)
		} catch (e) {
			return this.respondServerError(res)
		}
	}

	public updateSawInvitation = async (req: Request, res: Response) => {
		try {
			const id = req.params.id

			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const guest = await guests.findByIdAndUpdate(id, { saw_invitation: true })

			if (!guest) return this.respondInvalid(res, `Guest not found`)

			return this.respondSuccess(res, `Success`, guest)
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

			const find_id: any = await guests.find({
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
				group: [],
				deleted_at: formatDate(Date.now()),
				deleted_by: user.id,
			})

			if (!guest) return this.respondInvalid(res, `Guest error updating guest`)

			if (find_id[0].group.length) {
				if (!mongoose.Types.ObjectId.isValid(find_id[0].group[0].toString())) {
					return this.respondInvalid(res, `Invalid Group ID`)
				}
				const group = await groups.find({
					_id: find_id[0].group,
					deleted_at: { $exists: false },
				})

				if (!group.length) return this.respondInvalid(res, `Group not found`)

				const guests_of_group = group[0].guests.map((guest_id) => {
					return guest_id.toString()
				})

				const index = guests_of_group.findIndex((value) => {
					return value === find_id[0].group
				})

				guests_of_group.splice(index, 1)

				const updateGroup = await groups.findByIdAndUpdate(find_id[0].group, {
					guests: guests_of_group,
				})
				if (!updateGroup)
					return this.respondInvalid(
						res,
						`User deleted, but issue modifying the group`
					)
			}

			if (!guest) return this.respondInvalid(res, `Guest not found`)

			return this.respondSuccess(
				res,
				`Success`,
				` Record deleted: ${id} 💥💥💥`
			)
		} catch (e) {
			console.log(e)
		}
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
}

export default new GuestsController()
