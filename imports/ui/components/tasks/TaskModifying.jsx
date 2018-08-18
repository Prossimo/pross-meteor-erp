import React, { Component, PropTypes } from 'react'
import TaskDetail from './TaskDetail.jsx'
import store from '/imports/redux/store'
import {activeTask} from '/imports/redux/actions'

class TaskModifying extends Component {
  state = {
    task: {
      showDetail: false,
    },
  }

  componentDidMount() {
    const { task } = this.props
    const { projects: { activeTask } } = store.getState()
    if (task && task._id == activeTask) {
      this.showDetail()
    }
  }

  showDetail = () => {
    this.setState({
      task: {
        showDetail: true,
      },
    })
  }

  hideDetail = () => {
    this.setState({
      task: {
        showDetail: false,
      },
    })
    store.dispatch(activeTask(null))
  }

  render() {
    const task = _.clone(this.props.task)
    task.assignee = this.props.assignee
    task.approver = this.props.approver
    return (
      <TaskDetail
        showDetail={this.showDetail}
        hideDetail={this.hideDetail}
        isShown={this.state.task.showDetail}
        status={task.status}
        isNew={false}
        task={task}
        key={task._id}
        taskFolderId={this.props.taskFolderId}
        total={this.props.total}
      />
    )
  }
}

TaskModifying.propTypes = {
  task: PropTypes.object.isRequired,
  assignee: PropTypes.object,
  approver: PropTypes.object,
  taskFolderId: PropTypes.string,
  total: PropTypes.number.isRequired,
}

export default TaskModifying
