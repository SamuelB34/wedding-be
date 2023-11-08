import { BaseController } from "../base.controller"
import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import tables from "../../models/tables"

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

	// public create = async (req: Request, res: Response, next: NextFunction) => {
	// 	try {
	// 		const body = req.body as CreateGuestDto
	//
	// 		const email: string = body.email_address
	// 		const phone: string = body.phone_number
	//
	// 		// Check if email is repeated
	// 		const email_repeated = await guests.find({
	// 			email_address: email,
	// 			deleted_at: { $exists: false },
	// 		})
	// 		if (email_repeated.length)
	// 			return this.respondInvalid(res, `Email Address Repeated`)
	//
	// 		// Check if phone number is repeated
	// 		const phone_repeated = await guests.find({ phone_number: phone })
	// 		if (phone_repeated.length)
	// 			return this.respondInvalid(res, `Phone Number Repeated`)
	//
	// 		let data = {
	// 			...body,
	// 			created_at: formatDate(Date.now()),
	// 			created_by: "Admin",
	// 		}
	//
	// 		const newGuest = await guests.create(data)
	// 		if (!newGuest) return this.respondServerError(res)
	//
	// 		return this.respondSuccess(res, `Success`, newGuest)
	// 	} catch (err) {
	// 		next(err)
	// 	}
	// }
	//
	// public update = async (req: Request, res: Response) => {
	// 	try {
	// 		const body = req.body as UpdateGuestDto
	// 		const id = req.params.id
	//
	// 		// Check if the ID is valid
	// 		if (!mongoose.Types.ObjectId.isValid(id)) {
	// 			return this.respondInvalid(res, `Invalid ID`)
	// 		}
	//
	// 		const find_id = await guests.find({
	// 			_id: id,
	// 			deleted_at: { $exists: false },
	// 		})
	//
	// 		if (!find_id) return this.respondInvalid(res, `Guest not found`)
	//
	// 		const guest = await guests.findByIdAndUpdate(id, body)
	//
	// 		if (!guest) return this.respondInvalid(res, `Guest not found`)
	//
	// 		return this.respondSuccess(res, `Success`, body)
	// 	} catch (e) {
	// 		return this.respondServerError(res)
	// 	}
	// }
	//
	// public delete = async (req: Request, res: Response) => {
	// 	try {
	// 		const id = req.params.id
	// 		// Check if the ID is valid
	// 		if (!mongoose.Types.ObjectId.isValid(id)) {
	// 			return this.respondInvalid(res, `Invalid ID`)
	// 		}
	//
	// 		const find_id = await guests.find({
	// 			_id: id,
	// 			deleted_at: { $exists: false },
	// 		})
	//
	// 		if (!find_id) return this.respondInvalid(res, `Guest not found`)
	//
	// 		const guest = await guests.findByIdAndUpdate(id, {
	// 			deleted_at: formatDate(Date.now()),
	// 			deleted_by: "Samuel Barragan",
	// 		})
	//
	// 		if (!guest) return this.respondInvalid(res, `Guest not found`)
	//
	// 		return this.respondSuccess(
	// 			res,
	// 			`Success`,
	// 			` Record deleted: ${id} 💥💥💥`
	// 		)
	// 	} catch (e) {}
	// }
}

export default new TablesController()