import { BaseController } from "../base.controller"
import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import groups from "../../models/groups"
import { CreateGroupDto } from "./dtos/create-group.dto"
import { formatDate } from "../../middlewares/format"
import guests from "../../models/guests"
import { UpdateGroupDto } from "./dtos/update-group.dto"
import { respondUnauthorized } from "../../common/auth/common"
import { findFormat, findFormatGroups } from "../guests/find_format"

class GroupsController extends BaseController {
	public getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const query_params: any = req.query
			const skipRecords = (+query_params.p - 1) * +query_params.pp
			const sortBy = query_params.sort_by || "created_at" // Campo por defecto si no se envía sort_by
			const sortOrder = query_params.sort_order === "asc" ? 1 : -1 // Orden ascendente si sort_order es 'asc', descendente por defecto

			// Construye el pipeline de agregación
			const pipeline: any = [
				// Filtro inicial según los parámetros
				{ $match: findFormatGroups(query_params) },

				// Etapa para contar invitados
				{
					$lookup: {
						from: "guests",
						localField: "guests",
						foreignField: "_id",
						as: "guests_list",
					},
				},
				{
					$addFields: {
						count: { $size: "$guests_list" }, // Añade un campo 'count' que contiene el número de invitados
					},
				},

				// Etapa de ordenación dinámica
				{
					$sort: {
						[sortBy]: sortOrder, // Ordena según el campo `sortBy` (por ejemplo, 'count') y el orden `sortOrder`
					},
				},

				// Omite y limita los resultados
				{ $skip: skipRecords },
				{ $limit: +query_params.pp || 30 },
			]

			const docs: any = await groups.aggregate(pipeline)

			// Formatea los resultados para incluir solo los nombres de los invitados y el conteo
			const groups_list = docs.map((doc: any) => {
				const guests_names = doc.guests_list.map(
					(guest: any) => guest.full_name
				)
				return {
					...doc,
					guests: guests_names,
					count: guests_names.length,
				}
			})

			return this.respondSuccess(res, `Success`, groups_list)
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
			const docs = await groups.countDocuments(findFormatGroups(query_params))
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

			const group: any = await groups.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!group.length) return this.respondInvalid(res, `Group not found`)

			let guests_list: any[] = []

			// Check if group has guests
			if (group[0].guests.length) {
				guests_list = await guests.find({
					_id: { $in: group[0].guests },
					deleted_at: { $exists: false },
				})
			}

			const list = []
			for (const guestsListElement of guests_list) {
				list.push({
					label: guestsListElement.full_name,
					value: guestsListElement._id,
				})
			}

			const group_res = {
				...group[0]["_doc"],
				guests: list,
			}

			return this.respondSuccess(res, `Success`, group_res)
		} catch (err) {
			next(err)
		}
	}

	public create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			// @ts-ignore
			const user = req.user!
			const body = req.body as CreateGroupDto

			if (user?.role === "wedding-planner") {
				return respondUnauthorized(res)
			}

			const name: string = body.name
			const body_guests: string[] = body.guests

			// Check if name is repeated
			const name_repeated = await groups.find({
				name: name,
				deleted_at: { $exists: false },
			})

			if (name_repeated.length)
				return this.respondInvalid(res, `Group Already Created`)

			// If guests array contains ids
			if (body_guests.length) {
				// Check if ID's introduced are correct
				for (const id of body_guests) {
					if (!mongoose.Types.ObjectId.isValid(id)) {
						return this.respondInvalid(res, `Invalid ID`)
					}
				}

				// Check that guests id's exists
				const guests_list = await guests.find({
					_id: { $in: body_guests },
					deleted_at: { $exists: false },
				})

				const found_ids = guests_list.map((user) => user._id.toString())
				const missing_ids = guests_list.filter(
					(id: any) => !found_ids.includes(id)
				)

				if (missing_ids.length === 0) {
					return this.respondInvalid(res, `Some ID's introduced doesn't exist`)
				}
			}

			let data = {
				...body,
				created_at: formatDate(Date.now()),
				created_by: "Admin",
			}

			const new_group = await groups.create(data)
			if (!new_group) return this.respondServerError(res)

			// Add to the guests the group we created if it has guests list
			if (body_guests.length) {
				await guests.updateMany(
					{
						_id: { $in: body_guests },
						deleted_at: { $exists: false },
					},
					{ $set: { group: new_group["_id"].toString() } }
				)
			}

			return this.respondSuccess(res, `Success`, new_group)
		} catch (err) {
			console.log("HOLAAAA")
			next(err)
		}
	}

	public update = async (req: Request, res: Response) => {
		try {
			// @ts-ignore
			const user = req.user!
			const body = req.body as UpdateGroupDto
			const id = req.params.id

			// const name: string = body.name
			const body_guests: string[] = body.guests

			// Check if the ID is valid
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const find_id: any = await groups.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!find_id) return this.respondInvalid(res, `Group not found`)

			if (user?.role !== "admin" && id !== user?.id)
				return this.respondInvalid(
					res,
					`Only admins and the one created the group can update it`
				)

			// Remove current guests group
			if (find_id[0]["guests"].length) {
				await guests.updateMany(
					{
						_id: { $in: find_id[0]["guests"] },
						deleted_at: { $exists: false },
					},
					{ $set: { group: [] } }
				)
			}

			// If guests array contains ids
			if (body_guests.length) {
				// Check if ID's introduced are correct
				for (const id of body_guests) {
					if (!mongoose.Types.ObjectId.isValid(id)) {
						return this.respondInvalid(res, `Invalid ID`)
					}
				}

				// Check that guests id's exists
				const guests_list = await guests.find({
					_id: { $in: body_guests },
					deleted_at: { $exists: false },
				})

				const found_ids = guests_list.map((user) => user._id.toString())
				const missing_ids = guests_list.filter(
					(id: any) => !found_ids.includes(id)
				)

				if (missing_ids.length === 0) {
					return this.respondInvalid(res, `Some ID's introduced doesn't exist`)
				}
			}

			let data = {
				...body,
				updated_at: formatDate(Date.now()),
				updated_by: "Admin",
			}

			const group = await groups.findByIdAndUpdate(id, data)

			if (!group) return this.respondInvalid(res, `Group not found`)

			// Add to the guests the group we created if it has guests list
			if (body_guests.length) {
				await guests.updateMany(
					{
						_id: { $in: body_guests },
						deleted_at: { $exists: false },
					},
					{ $set: { group: [id] } }
				)
			}

			return this.respondSuccess(res, `Success`, group)
		} catch (e) {
			console.log(e)
			return this.respondServerError(res)
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

			if (user.role !== "admin" && user.id !== id)
				return this.respondInvalid(
					res,
					`Only admins and the one created the group can update it`
				)

			const find_id = await groups.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!find_id) return this.respondInvalid(res, `Group not found`)

			// Remove current guests group
			if (find_id[0]["guests"].length) {
				await guests.updateMany(
					{
						_id: { $in: find_id[0]["guests"] },
						deleted_at: { $exists: false },
					},
					{ $set: { group: [] } }
				)
			}

			const guest = await groups.findByIdAndUpdate(id, {
				deleted_at: formatDate(Date.now()),
				deleted_by: "Samuel Barragan",
			})

			if (!guest) return this.respondInvalid(res, `Group not found`)

			return this.respondSuccess(
				res,
				`Success`,
				` Record deleted: ${id} 💥💥💥`
			)
		} catch (e) {}
	}
}

export default new GroupsController()
