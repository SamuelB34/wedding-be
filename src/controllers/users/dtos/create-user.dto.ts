import { UserRole } from "../../../models/users"

export class CreateUserDto {
	first_name!: string

	middle_name?: string

	last_name!: string

	username!: string

	password!: string

	role!: UserRole
}
