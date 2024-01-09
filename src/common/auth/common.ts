import { Request, Response } from "express"
import { LoginJwt } from "../../controllers/auth/auth.controller"
const jwt = require("jsonwebtoken")

export const getUserFromJWT = (req: Request) => {
	let bearerHeader =
		req.headers["Authorization"] || req.headers["authorization"]

	if (!bearerHeader || Array.isArray(bearerHeader)) return false

	let token = bearerHeader.split(" ")[1]

	try {
		// Validate token
		let decoded: any = jwt.verify(token, process.env.JWT_SECRET ?? "")

		if (!decoded.user_id || !decoded.user_username) return false

		// Token is valid, return id and username
		return <LoginJwt>{
			user_id: decoded.user_id,
			user_username: decoded.user_username,
		}
	} catch (e) {
		return false
	}
}

/**
 * Responds with a generic unauthorized message
 * @param res
 */
export const respondUnauthorized = (res: Response) => {
	const error = `You don't have access to this resource`

	return res.status(401).send({
		msg: null,
		data: null,
		error,
	})
}

/**
 * Responds with a generic unauthenticated message
 * @param res
 */
export const respondUnauthenticated = (res: Response) => {
	const error = `User unauthenticated, please contact support.`

	return res.status(401).send({
		msg: null,
		data: null,
		error,
	})
}
