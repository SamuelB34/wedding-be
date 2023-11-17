import { IsArray, IsNumber, IsOptional } from "class-validator"

export class UpdateTableDto {
	@IsNumber()
	number!: number

	@IsArray()
	@IsOptional()
	guests?: string[]

	@IsArray()
	@IsOptional()
	groups?: string[]
}
