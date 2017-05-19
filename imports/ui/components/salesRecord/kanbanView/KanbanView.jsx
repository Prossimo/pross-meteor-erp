import React, {Component} from 'react';
import KanbanColumn from './KanbanColumn'
class KanbanView extends Component {
	constructor() {
		super();
		this.columns = [
			{
				title: 'Lead',
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
				title: 'Ticket',
				id: 'ticket'
			}
		]
	}
	filterColumn(col) {
		return this.props.salesRecords.filter((deal)=>{
			return deal.stage === col.id
		})
	}
	render() {
		const { salesRecords = []} = this.props;
		return (
			<div className="task-board-container">
				<div className="col-md-12">
					{this.columns.map((col) => {
						const data = this.filterColumn(col);
						return <KanbanColumn key={col.id} deals={data} colName={col.title} />
					})}
				</div>
			</div>
		)
	}
}
export default KanbanView
