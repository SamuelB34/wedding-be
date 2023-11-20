import {
	IsBoolean,
	IsDate,
	IsDateString,
	IsEmail,
	IsIn,
	IsOptional,
	IsPhoneNumber,
	IsString,
} from "class-validator"
import { IsDateTime } from "../../../common/validators/IsDateTime"
import { UserRole } from "../../../models/users"

export class CreateUserDto {
	@IsString()
	first_name!: string

	@IsString()
	@IsOptional()
	middle_name?: string

	@IsString()
	last_name!: string

	@IsString()
	username!: string

	@IsString()
	password!: string

	@IsString()
	@IsIn(Object.values(UserRole))
	role!: UserRole
}
