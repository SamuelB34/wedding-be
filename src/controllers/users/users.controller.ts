import { BaseController } from "../base.controller"
import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { formatDate } from "../../middlewares/format"
import { CreateUserDto } from "./dtos/create-user.dto"
import users from "../../models/users"
import guests from "../../models/guests"
const bcrypt = require("bcrypt")

class UsersController extends BaseController {
	public getById = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const id = req.params.id

			// Check if the ID is valid
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const guest = await users.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!guest.length) return this.respondInvalid(res, `User not found`)

			const data = {
				_id: id,
				first_name: guest[0].first_name,
				middle_name: guest[0].middle_name || "",
				last_name: guest[0].last_name,
				username: guest[0].username,
				authenticated: guest[0].authenticated,
			}

			return this.respondSuccess(res, `Success`, data)
		} catch (err) {
			next(err)
		}
	}

	public create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const body = req.body as CreateUserDto

			const username: string = body.username
			const first_name: string = body.first_name
			const last_name: string = body.last_name

			// Check if username is repeated
			const username_repeated = await users.find({
				username: username,
				deleted_at: { $exists: false },
			})

			if (username_repeated.length)
				return this.respondInvalid(res, `User Already Created`)

			// Check if name is repeated
			const duplicate_name_repeated = await users.find({
				first_name: first_name,
				last_name: last_name,
				deleted_at: { $exists: false },
			})

			if (duplicate_name_repeated.length)
				return this.respondInvalid(res, `User Already Created`)

			const password: string = body.password
			const hashed_password = bcrypt.hashSync(password, 12)

			const data = {
				...body,
				password: hashed_password,
				authenticated: false,

				created_at: formatDate(Date.now()),
				created_by: "Admin",
			}

			const new_user = await users.create(data)
			if (!new_user) return this.respondServerError(res)

			return this.respondSuccess(res, `Success`, new_user)
		} catch (err) {
			next(err)
		}
	}

	public delete = async (req: Request, res: Response) => {
		try {
			const id = req.params.id
			// Check if the ID is valid
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return this.respondInvalid(res, `Invalid ID`)
			}

			const find_id = await users.find({
				_id: id,
				deleted_at: { $exists: false },
			})

			if (!find_id) return this.respondInvalid(res, `User not found`)

			await users.findByIdAndUpdate(id, {
				authenticated: false,
				deleted_at: formatDate(Date.now()),
				deleted_by: "Admin",
			})

			return this.respondSuccess(
				res,
				`Success`,
				` Record deleted: ${id} 💥💥💥`
			)
		} catch (e) {}
	}
}

export default new UsersController()
