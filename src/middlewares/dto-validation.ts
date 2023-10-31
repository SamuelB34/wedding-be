import { NextFunction, Request, RequestHandler, Response } from "express"
import { plainToInstance } from "class-transformer"
import { validate, ValidationError } from "class-validator"
import { sanitize } from "class-sanitizer"

/**
 * Middleware to be used by routes that should receive a DTO
 * @param type
 * @param skipMissingProperties
 * @param from
 */
export const dtoValidation = (
	type: any,
	skipMissingProperties = false,
	from: "body" | "query" = "body"
): RequestHandler => {
	return (req: Request, res: Response, next: NextFunction) => {
		let dtoObj: unknown[] = []

		// If body is an array (this happens when we use a DTO with SendGrid webhooks),
		// well transform it to object, with a single "data" property
		if (Array.isArray(req.body)) req.body = { data: req.body }

		if (from == "body") dtoObj = plainToInstance(type, req.body)
		else if (from == "query") dtoObj = plainToInstance(type, req.query)

		// whitelist = true will remove all unknown (non-annotated) properties from dtoObj

		const parseErrors = function (errors: ValidationError[]): Response | void {
			if (errors.length > 0) {
				let property = errors[0].property
				let error
				if (errors[0].constraints) {
					// This means error is at the top level, so let's load it
					error = Object.values(errors[0].constraints as Object)[0]
				} else {
					return parseErrors(errors[0].children!)
				}

				// Respond with error directly from this middleware, instead of going to
				// the next with error
				return res.status(400).send({
					msg: null,
					data: null,
					error: `${error} (in ${property})`,
				})

				//next(new Error(error))
			} else {
				sanitize(dtoObj)
				req.body = dtoObj
				return next()
			}
		}

		/**
		 * use forbidNonWhitelisted=true and forbidUnknownValues=true to throw an error
		 * when an unknown property is passed
		 */

		validate(dtoObj, { skipMissingProperties, whitelist: true }).then(
			parseErrors
		)
	}
}
