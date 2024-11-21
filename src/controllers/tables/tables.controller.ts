import { BaseController } from "../base.controller"
import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import tables from "../../models/tables"
import groups from "../../models/groups"
import guests from "../../models/guests"
import { formatDate } from "../../middlewares/format"
import { CreateTableDto } from "./dtos/create-table.dto"
import { UpdateGroupDto } from "../groups/dtos/update-group.dto"
import { UpdateTableDto } from "./dtos/update-table.dto"
import { respondUnauthorized } from "../../common/auth/common"

class TablesController extends BaseController {
	public getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const docs = await tables.find({ deleted_at: { $exists: false } })
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

			const table = await tables.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!table.length) return this.respondInvalid(res, `Table not found`)

			return this.respondSuccess(res, `Success`, table)
		} catch (err) {
			next(err)
		}
	}

	public create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			// @ts-ignore
			const user = req.user!
			const body = req.body as CreateTableDto

			const number: number = body.number
			const body_guests: string[] = body.guests || []
			const body_groups: string[] = body.groups || []

			if (user?.role === "wedding-planner") {
				return respondUnauthorized(res)
			}

			// Check if number is repeated
			const number_repeated = await tables.find({
				number: number,
				deleted_at: { $exists: false },
			})

			if (number_repeated.length)
				return this.respondInvalid(res, `Table Already Created`)

			// Validate guests
			if (body_guests.length) {
				for (const guest_id of body_guests) {
					if (!mongoose.Types.ObjectId.isValid(guest_id)) {
						return this.respondInvalid(res, `Invalid Guest ID`)
					}
				}

				const guests_list = await guests.find({
					_id: { $in: body_guests },
					deleted_at: { $exists: false },
				})

				const found_ids = guests_list.map((user) => user._id.toString())
				const missing_ids = body_guests.filter(
					(id: any) => !found_ids.includes(id)
				)

				if (missing_ids.length) {
					return this.respondInvalid(
						res,
						`Some Guests ID's introduced don't exist`
					)
				}
			}

			// Validate groups
			let group_guests: string[] = []
			if (body_groups.length) {
				for (const group_id of body_groups) {
					if (!mongoose.Types.ObjectId.isValid(group_id)) {
						return this.respondInvalid(res, `Invalid Group ID`)
					}
				}

				const groups_list = await groups.find({
					_id: { $in: body_groups },
					deleted_at: { $exists: false },
				})

				const found_ids = groups_list.map((group) => group._id.toString())
				const missing_ids = body_groups.filter(
					(id: any) => !found_ids.includes(id)
				)

				if (missing_ids.length) {
					return this.respondInvalid(
						res,
						`Some Groups ID's introduced don't exist`
					)
				}

				// Get all guests from groups
				const group_members = groups_list
					.map((group) => {
						return group.guests
					})
					.flat()

				group_guests = group_members.map((member) => member.toString())
			}

			const all_guests = group_guests.concat(body_guests)

			let data = {
				...body,
				created_at: formatDate(Date.now()),
				created_by: "Admin",
			}

			const new_table = await tables.create(data)
			if (!new_table) return this.respondServerError(res)

			// Update guests with table ID
			if (all_guests.length) {
				await guests.updateMany(
					{
						_id: { $in: all_guests },
						deleted_at: { $exists: false },
					},
					{ $set: { table: new_table["_id"].toString() } }
				)
			}

			return this.respondSuccess(res, `Success`, new_table)
		} catch (err) {
			next(err)
		}
	}

	public update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			// @ts-ignore
			const user = req.user!
			const body = req.body as UpdateTableDto

			const id = req.params.id
			const body_guests: string[] = body.guests || []
			const body_groups: string[] = body.groups || []

			const find_id: any = await tables.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!find_id.length) return this.respondInvalid(res, `Table Not Found`)

			if (user?.role !== "admin" && id !== user?.id)
				return this.respondInvalid(
					res,
					`Only admins and the one created the table can update it`
				)

			// Validate guests
			if (body_guests.length) {
				for (const guest_id of body_guests) {
					if (!mongoose.Types.ObjectId.isValid(guest_id)) {
						return this.respondInvalid(res, `Invalid Guest ID`)
					}
				}

				const guests_list = await guests.find({
					_id: { $in: body_guests },
					deleted_at: { $exists: false },
				})

				const found_ids = guests_list.map((user) => user._id.toString())
				const missing_ids = body_guests.filter(
					(id: any) => !found_ids.includes(id)
				)

				if (missing_ids.length) {
					return this.respondInvalid(
						res,
						`Some Guests ID's introduced don't exist`
					)
				}
			}

			// Validate groups
			let group_guests: string[] = []
			if (body_groups.length) {
				for (const group_id of body_groups) {
					if (!mongoose.Types.ObjectId.isValid(group_id)) {
						return this.respondInvalid(res, `Invalid Group ID`)
					}
				}

				const groups_list = await groups.find({
					_id: { $in: body_groups },
					deleted_at: { $exists: false },
				})

				const found_ids = groups_list.map((group) => group._id.toString())
				const missing_ids = body_groups.filter(
					(id: any) => !found_ids.includes(id)
				)

				if (missing_ids.length) {
					return this.respondInvalid(
						res,
						`Some Groups ID's introduced don't exist`
					)
				}

				// Get all guests from groups
				const group_members = groups_list
					.map((group) => {
						return group.guests
					})
					.flat()

				group_guests = group_members.map((member) => member.toString())
			}

			const all_guests = group_guests.concat(body_guests)

			let data = {
				...body,
				updated_at: formatDate(Date.now()),
				updated_by: "Admin",
			}

			const update_table = await tables.findByIdAndUpdate(id, data)
			if (!update_table) return this.respondInvalid(res, "No Table Found")

			// Update guests with table ID
			if (all_guests.length) {
				console.log("ENTRE AQUI AMIX")
				await guests.updateMany(
					{
						_id: { $in: all_guests },
						deleted_at: { $exists: false },
					},
					{ $set: { table: update_table["_id"].toString() } }
				)
			}

			return this.respondSuccess(res, `Success`, data)
		} catch (err) {
			next(err)
		}
	}

	public delete = async (req: Request, res: Response) => {
		try {
			// @ts-ignore
			const user = req.user!
			const id = req.params.id
			// Check if the ID is valid
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const find_id = await tables.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!find_id) return this.respondInvalid(res, `Table not found`)

			if (user?.role !== "admin" && id !== user?.id)
				return this.respondInvalid(
					res,
					`Only admins and the one created the table can update it`
				)

			// Remove current guests table
			if (find_id[0]["guests"].length) {
				const guests_list = await guests.updateMany(
					{
						_id: { $in: find_id[0]["guests"] },
						deleted_at: { $exists: false },
					},
					{
						$set: {
							table: [],
							updated_at: formatDate(Date.now()),
							updated_by: "Samuel Barragan",
						},
					}
				)
				if (!guests_list) return this.respondInvalid(res, `Guests not found`)
			}

			// Remove current groups table
			if (find_id[0]["groups"].length) {
				const groups_list = await groups.updateMany(
					{
						_id: { $in: find_id[0]["groups"] },
						deleted_at: { $exists: false },
					},
					{
						$set: {
							table: [],
							updated_at: formatDate(Date.now()),
							updated_by: "Samuel Barragan",
						},
					}
				)
				if (!groups_list) return this.respondInvalid(res, `Groups not found`)
			}

			const table = await tables.findByIdAndUpdate(id, {
				deleted_at: formatDate(Date.now()),
				deleted_by: "Samuel Barragan",
			})

			if (!table) return this.respondInvalid(res, `Table not found`)
			return this.respondSuccess(
				res,
				`Success`,
				` Record deleted: ${id} 💥💥💥`
			)
		} catch (e) {}
	}
}

export default new TablesController()
