import {
	IsBoolean,
	IsDate,
	IsDateString,
	IsEmail,
	IsOptional,
	IsPhoneNumber,
	IsString,
} from "class-validator"
import { IsDateTime } from "../../../common/validators/IsDateTime"

export class CreateGuestDto {
	@IsString()
	first_name!: string

	@IsString()
	@IsOptional()
	middle_name?: string

	@IsString()
	last_name!: string

	@IsEmail()
	email_address!: string

	@IsPhoneNumber("MX")
	phone_number!: string

	@IsBoolean()
	assist!: boolean

	@IsBoolean()
	saw_invitation!: boolean

	@IsString()
	@IsOptional()
	group?: string

	@IsString()
	@IsOptional()
	table?: string

	@IsString()
	@IsDateTime()
	created_at!: string

	@IsString()
	created_by!: string
}
