import React, {Component} from 'react'
import KanbanItem from './KanbanItem'
import { info, warning  } from '/imports/api/lib/alerts'

class KanbanColumn extends Component {
  handleDrop(event) {
    const deal = JSON.parse(event.dataTransfer.getData('deal'))
    Meteor.call('updateProjectProperty', deal._id, { key: 'stage' , value: event.currentTarget.id }, (error) => {
        if(error) return warning(`Problems with updating project. ${error.error}`)
        return info('Success update project')
    })
  }
  render() {
    const { deals = [], colName, id } = this.props
    return (
      <div className="col-md-3 column-container">
        <div className="column-wrapper"
          id={id}
          onDragOver={event => event.preventDefault()}
          onDrop={this.handleDrop}
        >
          <div className="column-header">
            {colName}
          </div>
          <div>
            {deals.map((deal) => {
              return <KanbanItem deal={deal} key={deal._id}/>
            })}
          </div>
      </div>
    </div>
    )
  }
}
export default KanbanColumn
