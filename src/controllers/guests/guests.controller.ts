import guests, { GuestType } from "../../models/guests"
import { BaseController } from "../base.controller"
import { Request, Response, NextFunction } from "express"
import { CreateGuestDto } from "./dtos/create-guest.dto"
import { formatDate } from "../../middlewares/format"
import { UpdateGuestDto } from "./dtos/update-guest.dto"
import mongoose from "mongoose"
import { respondUnauthorized } from "../../common/auth/common"
import users from "../../models/users"

class GuestsController extends BaseController {
	public getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const query_params: any = req.query

			const skipRecords = (+query_params.p - 1) * +query_params.pp
			const filter = query_params.filter
			let filter_users = []

			if (query_params.search) {
				if (filter && filter !== "all") {
					if (filter === "barragan.m") {
						filter_users = [
							"659c4d528854328da35719c8",
							"659c4d788854328da35719cc",
						]
					} else if (filter === "araiza.s") {
						filter_users = [
							"659c4de08854328da35719d0",
							"659c4dfc8854328da35719d4",
						]
					} else {
						filter_users = [
							"659c4ca18854328da35719c4",
							"659a14f1f429caac82b1f61a",
						]
					}
					const docs: any = await guests.aggregate([
						{
							$match: {
								$and: [
									{ created_by: { $in: filter_users } },
									{ deleted_at: { $exists: false } },
								],
								$expr: {
									$regexMatch: {
										input: {
											$concat: [
												"$first_name",
												" ",
												"$middle_name",
												" ",
												"$last_name",
											],
										},
										regex: query_params.search,
										options: "i",
									},
								},
							},
						},
						{
							$project: {
								full_name: {
									$concat: [
										"$first_name",
										" ",
										"$middle_name",
										" ",
										"$last_name",
									],
								},
								first_name: 1,
								middle_name: 1,
								last_name: 1,
								created_at: 1,
							},
						},
						{
							$sort: { created_at: -1 },
						},
						{
							$skip: +skipRecords,
						},
						{
							$limit: +query_params.pp || 30,
						},
					])

					let data: any[] = []

					if (docs.length) {
						for (const doc of docs) {
							const user = await users.find({
								_id: doc.created_by,
								deleted_at: { $exists: false },
							})

							if (!user.length)
								return this.respondInvalid(res, `User not found`)

							data.push({
								...doc["_doc"],
								_id: doc["_doc"]._id,
								created_by: {
									_id: doc.created_by,
									username: user[0].username,
								},
							})
						}
					} else {
						data = docs
					}

					return this.respondSuccess(res, `Success`, data)
				} else {
					const docs: any = await guests
						.find({
							$or: [
								{ first_name: { $regex: query_params.search, $options: "i" } },
								{ middle_name: { $regex: query_params.search, $options: "i" } },
								{ last_name: { $regex: query_params.search, $options: "i" } },
							],
							deleted_at: { $exists: false },
						})
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

							if (!user.length)
								return this.respondInvalid(res, `User not found`)

							data.push({
								...doc["_doc"],
								_id: doc["_doc"]._id,
								created_by: {
									_id: doc.created_by,
									username: user[0].username,
								},
							})
						}
					} else {
						data = docs
					}

					return this.respondSuccess(res, `Success`, data)
				}
			} else {
				if (filter === "barragan.m") {
					filter_users = [
						"659c4d528854328da35719c8",
						"659c4d788854328da35719cc",
					]
				} else if (filter === "araiza.s") {
					filter_users = [
						"659c4de08854328da35719d0",
						"659c4dfc8854328da35719d4",
					]
				} else if (filter === "admins") {
					filter_users = [
						"659c4ca18854328da35719c4",
						"659a14f1f429caac82b1f61a",
					]
				} else {
					filter_users = [
						"659c4ca18854328da35719c4",
						"659a14f1f429caac82b1f61a",
						"659c4de08854328da35719d0",
						"659c4dfc8854328da35719d4",
						"659c4d528854328da35719c8",
						"659c4d788854328da35719cc",
					]
				}
				const docs: any = await guests
					.find({
						deleted_at: { $exists: false },
						created_by: { $in: filter_users },
					})
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

						data.push({
							...doc["_doc"],
							_id: doc["_doc"]._id,
							created_by: {
								_id: doc.created_by,
								username: user[0].username,
							},
						})
					}
				} else {
					data = docs
				}

				return this.respondSuccess(res, `Success`, data)
			}
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
			const filter = query_params.filter
			let filter_users = []

			if (query_params.search) {
				if (filter && filter !== "all") {
					if (filter === "barragan.m") {
						filter_users = [
							"659c4d528854328da35719c8",
							"659c4d788854328da35719cc",
						]
					} else if (filter === "araiza.s") {
						filter_users = [
							"659c4de08854328da35719d0",
							"659c4dfc8854328da35719d4",
						]
					} else {
						filter_users = [
							"659c4ca18854328da35719c4",
							"659a14f1f429caac82b1f61a",
						]
					}
					const docs = await guests.countDocuments({
						$or: [
							{ first_name: { $regex: query_params.search, $options: "i" } },
							{ middle_name: { $regex: query_params.search, $options: "i" } },
							{ last_name: { $regex: query_params.search, $options: "i" } },
						],
						created_by: { $in: filter_users },
						deleted_at: { $exists: false },
					})
					return this.respondSuccess(res, `Success`, { total_count: docs })
				} else {
					if (filter === "barragan.m") {
						filter_users = [
							"659c4d528854328da35719c8",
							"659c4d788854328da35719cc",
						]
					} else if (filter === "araiza.s") {
						filter_users = [
							"659c4de08854328da35719d0",
							"659c4dfc8854328da35719d4",
						]
					} else {
						filter_users = [
							"659c4ca18854328da35719c4",
							"659a14f1f429caac82b1f61a",
						]
					}
					const docs = await guests.countDocuments({
						$or: [
							{ first_name: { $regex: query_params.search, $options: "i" } },
							{ middle_name: { $regex: query_params.search, $options: "i" } },
							{ last_name: { $regex: query_params.search, $options: "i" } },
						],
						created_by: { $in: filter_users },
						deleted_at: { $exists: false },
					})
					return this.respondSuccess(res, `Success`, { total_count: docs })
				}
			} else {
				if (filter === "barragan.m") {
					filter_users = [
						"659c4d528854328da35719c8",
						"659c4d788854328da35719cc",
					]
				} else if (filter === "araiza.s") {
					filter_users = [
						"659c4de08854328da35719d0",
						"659c4dfc8854328da35719d4",
					]
				} else {
					filter_users = [
						"659c4ca18854328da35719c4",
						"659a14f1f429caac82b1f61a",
					]
				}
				if (filter && filter !== "all") {
					const docs = await guests.countDocuments({
						deleted_at: { $exists: false },
						created_by: { $in: filter_users },
					})
					return this.respondSuccess(res, `Success`, { total_count: docs })
				} else {
					const docs = await guests.countDocuments({
						deleted_at: { $exists: false },
					})

					return this.respondSuccess(res, `Success`, { total_count: docs })
				}
			}
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
}

export default new GuestsController()
