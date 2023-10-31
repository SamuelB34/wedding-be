import {
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsPositive,
	IsString,
} from "class-validator"

export class GetMessagesDto {
	@IsOptional()
	// @Transform((o) => parseInt(o.value))
	// @IsNumber()
	// @IsPositive()
	p?: number

	@IsOptional()
	// @Transform((o) => parseInt(o.value))
	// @IsNumber()
	// @IsPositive()
	pp?: number

	@IsOptional()
	// @TransformStringToBoolean()
	// @IsBoolean()
	for_dependent_parent?: boolean

	@IsOptional()
	// @IsString()
	sort_by?: string
}
