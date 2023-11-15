import mongoose, { model } from "mongoose"

export interface GroupsType {
	name: string
	guests: string[]
	table: string[]

	created_at: string
	created_by: string
	updated_at?: string
	updated_by?: string
	deleted_at?: string
	deleted_by?: string
}

const groupsSchema = new mongoose.Schema<GroupsType>({
	name: { type: String, required: true },
	guests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Guests" }],
	table: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tables" }],

	created_at: { type: String, required: true },
	created_by: { type: String, required: true },
	updated_at: { type: String },
	updated_by: { type: String },
	deleted_at: { type: String },
	deleted_by: { type: String },
})

const Group = model<GroupsType>("Groups", groupsSchema)

export default Group
