import { Response } from "express"

export abstract class BaseController {
	/**
	 * Returns success (200)
	 * @param res
	 * @param msg
	 * @param data
	 */
	public respondSuccess<T>(res: Response, msg?: string, data?: T) {
		return res.status(200).send({
			msg: msg ?? null,
			data: data ?? null,
		})
	}
	/**
	 * Returns not found (404)
	 * @param res
	 * @param error
	 */
	public respondNotFound(res: Response, error?: string) {
		return res.status(404).send({
			msg: error ?? null,
			data: null,
		})
	}

	/**
	 * Returns error (500)
	 * @param res
	 * @param error
	 */
	public respondServerError(res: Response, error?: string) {
		return res.status(500).send({
			msg: error ?? `Unexpected error occurred`,
			data: null,
		})
	}

	/**
	 * Returns invalid (400)
	 * @param res
	 * @param error
	 */
	public respondInvalid(res: Response, error?: string) {
		return res.status(400).send({
			msg: null,
			data: null,
			error: error ?? null,
		})
	}

	/**
	 * Returns unauthorized (401)
	 * This is when a client is not signed in, or has invalid credentials
	 *
	 * @param res
	 * @param error
	 */
	public respondUnauthorized(res: Response, error?: string) {
		return res.status(401).send({
			msg: error ?? null,
			data: null,
		})
	}

	/**
	 * Returns forbidden (403)
	 * This is when a client is signed in, but doesn't have enough privileges
	 *
	 * @param res
	 * @param error
	 */
	public respondForbidden(res: Response, error?: string) {
		return res.status(403).send({
			msg: error ?? null,
			data: null,
		})
	}

	/**
	 * Returns resource already exists (409)
	 * @param res
	 * @param error
	 */
	public respondResourceExists(res: Response, error?: string) {
		return res.status(409).send({
			msg: error ?? null,
			data: null,
		})
	}
}
