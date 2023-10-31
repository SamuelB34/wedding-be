import {
	registerDecorator,
	ValidationOptions,
	ValidationArguments,
	ValidatorConstraintInterface,
	ValidatorConstraint,
} from "class-validator"

/**
 * Custom decorator that will validate that field has a date in DD/MM/YYYY HH:MM:SS format
 */

@ValidatorConstraint({ name: "isDateTime", async: false })
class IsDateDmyHmsConstraint implements ValidatorConstraintInterface {
	validate(
		value: any,
		validationArguments?: ValidationArguments
	): Promise<boolean> | boolean {
		return isDateTime(value)
	}

	defaultMessage(validationArguments?: ValidationArguments): string {
		return `$property must be in a DD/MM/YYYY HH:MM:SS format`
	}
}

export function IsDateTime(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			name: "isDateTime",
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: IsDateDmyHmsConstraint,
		})
	}
}

export const isDateTime = (value: any) => {
	// The regular expression for DD/MM/YYYY HH:MM:SS format
	return (
		typeof value === "string" &&
		/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(value)
	)
}
