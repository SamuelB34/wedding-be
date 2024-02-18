export const findFormat = (query_params: any) => {
	let search = query_params.search
	const filter = query_params.filter

	if (search && filter) {
		const filter_users = filter.split(",")

		return {
			$or: [
				{ first_name: { $regex: query_params.search, $options: "i" } },
				{ middle_name: { $regex: query_params.search, $options: "i" } },
				{ last_name: { $regex: query_params.search, $options: "i" } },
			],
			created_by: { $in: filter_users },
			deleted_at: { $exists: false },
		}
	} else if (filter) {
		const filter_users = filter.split(",")

		return {
			created_by: { $in: filter_users },
			deleted_at: { $exists: false },
		}
	} else {
		return {
			deleted_at: { $exists: false },
		}
	}
}
