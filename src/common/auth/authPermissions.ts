import { getUserFromJWT, respondUnauthorized } from "./common"
import { Request, Response, NextFunction } from "express"
import users, { UserRole } from "../../models/users"

export const authPermissions = (min_role?: UserRole) => {
	return async (req: Request, res: Response) => {
		let jwtInfo = getUserFromJWT(req)

		if (!jwtInfo || !jwtInfo.user_id || !jwtInfo.user_username)
			return respondUnauthorized(res)

		// Get user's information
		const user = await users.find({
			_id: jwtInfo.user_id,
			deleted_at: { $exists: false },
		})

		// No user? Finish
		if (!user.length) return respondUnauthorized(res)

		// No authenticated? finish
		if (!user[0].authenticated) return respondUnauthorized(res)
	}
}
