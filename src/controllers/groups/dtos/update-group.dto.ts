import { IsArray, IsString } from "class-validator"

export class UpdateGroupDto {
	@IsString()
	name!: string

	@IsArray()
	guests!: string[]
}
