import mongoose, { model } from "mongoose"

export interface GuestType {
	first_name: string
	middle_name?: string
	last_name: string
	full_name?: string
	email_address: string
	phone_number: string
	assist: boolean
	answer: boolean
	saw_invitation: boolean
	group?: string
	table?: string
	created_by: string
	created_at: string
	updated_by?: string
	updated_at?: string
	deleted_by?: string
	deleted_at?: string
}

const guestsSchema = new mongoose.Schema<GuestType>({
	first_name: { type: String, required: true },
	middle_name: { type: String },
	last_name: { type: String, required: true },
	full_name: { type: String },
	email_address: { type: String, required: true },
	phone_number: { type: String, required: true },
	assist: { type: Boolean, required: true },
	answer: { type: Boolean, required: true, default: false },
	saw_invitation: { type: Boolean, required: true },
	group: [{ type: mongoose.Schema.Types.ObjectId, ref: "Groups" }],
	table: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tables" }],
	created_at: { type: String, required: true },
	created_by: { type: String, required: true },
	updated_at: { type: String },
	updated_by: { type: String },
	deleted_at: { type: String },
	deleted_by: { type: String },
})

const Guest = model<GuestType>("Guests", guestsSchema)

export default Guest
