import React, {Component} from 'react'
import KanbanItem from './KanbanItem'
class KanbanColumn extends Component {
	render() {
		const { deals = [], colName } = this.props;
		return (
			<div className="col-md-3 column-container">
				<div className="column-wrapper">
					<div className="column-header">
						{colName}
					</div>
					<div>
						{deals.map((deal)=>{
							return <KanbanItem deal={deal} key={deal._id}/>
						})}
					</div>
				</div>
			</div>
		)
	}
}
export default KanbanColumn;
