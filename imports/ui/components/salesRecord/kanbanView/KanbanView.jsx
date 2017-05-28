import React, {Component} from 'react'
import KanbanColumn from './KanbanColumn'
class KanbanView extends Component {
	constructor() {
		super()
		this.columns = [
			{
				title: 'Leads',
				id: 'lead'
			},
			{
				title: 'Opportunities',
				id: 'opportunity'
			},
			{
				title: 'Orders',
				id: 'order'
			},
			{
				title: 'Tickets',
				id: 'ticket'
			}
		]
	}
	filterColumn(col) {
		return this.props.salesRecords.filter((deal) => {
			return deal.stage === col.id
		})
	}
	render() {
		return (
			<div className="task-board-container">
				<div className="col-md-12">
					{this.columns.map((col) => {
						let data = this.filterColumn(col)
						data = _.sortBy(data, ({ createdAt }) => -createdAt.getTime())
						return <KanbanColumn key={col.id} deals={data} colName={col.title} id={col.id} />
					})}
				</div>
			</div>
		)
	}
}
export default KanbanView
