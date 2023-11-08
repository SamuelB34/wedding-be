import mongoose, { model } from "mongoose"

export interface TablesType {
	number: string
	groups: string[]
	guests: string[]

	created_at: string
	created_by: string
	updated_at?: string
	updated_by?: string
	deleted_at?: string
	deleted_by?: string
} // ID, Numero, Grupos, invitados

const tablesSchema = new mongoose.Schema<TablesType>({
	number: { type: String, required: true },
	groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Groups" }],
	guests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Guests" }],

	created_at: { type: String, required: true },
	created_by: { type: String, required: true },
	updated_at: { type: String },
	updated_by: { type: String },
	deleted_at: { type: String },
	deleted_by: { type: String },
})

const Group = model<TablesType>("Tables", tablesSchema)

export default Group
