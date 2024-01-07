export class UpdateGuestDto {
	first_name!: string

	middle_name?: string

	last_name!: string

	email_address!: string

	phone_number!: string

	assist!: boolean

	saw_invitation!: boolean

	group?: string

	table?: string
}
