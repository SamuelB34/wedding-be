import { BaseController } from "../base.controller"
import { NextFunction, Request, Response } from "express"
import users from "../../models/users"
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

export interface LoginJwt {
	user_id: string
	user_username: string
	user_role: string
}

class AuthController extends BaseController {
	public login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const body = req.body
			const password: string = body.password

			const user = await users.find({
				username: body.username,
				deleted_at: { $exists: false },
			})

			if (!user.length)
				return this.respondInvalid(res, `Invalid username or password`)

			const user_password: string = user[0].password

			const check_user_password = await bcrypt.compare(password, user_password)

			if (!check_user_password)
				return this.respondInvalid(res, `Invalid username or password`)

			const payload: LoginJwt = {
				user_id: user[0]._id.toString(),
				user_username: user[0].username,
				user_role: user[0].role,
			}

			const token = {
				id: user[0]._id,
				jwt: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "28d" }),
			}

			return this.respondSuccess(res, `Success`, token)
		} catch (err) {
			next(err)
		}
	}
}

export default new AuthController()
