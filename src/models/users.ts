import mongoose, { model } from "mongoose"

export enum UserRole {
	ADMIN = "admin",
	PARENTS = "parents",
	WEDDING_PLANNER = "wedding-planner",
}

export interface UserType {
	first_name: string
	middle_name?: string
	last_name: string
	username: string
	password: string
	role: UserRole
	authenticated: boolean

	created_at: string
	created_by: string
	updated_at?: string
	updated_by?: string
	deleted_at?: string
	deleted_by?: string
}

const usersSchema = new mongoose.Schema<UserType>({
	first_name: { type: String, required: true },
	middle_name: { type: String },
	last_name: { type: String, required: true },
	username: { type: String, required: true },
	password: { type: String, required: true },
	role: {
		type: String,
		enum: Object.values(UserRole),
		required: true,
		default: UserRole.WEDDING_PLANNER,
	},
	authenticated: { type: "Boolean", required: true, default: false },

	created_at: { type: String, required: true },
	created_by: { type: String, required: true },
	updated_at: { type: String },
	updated_by: { type: String },
	deleted_at: { type: String },
	deleted_by: { type: String },
})

const User = model<UserType>("Users", usersSchema)

export default User
