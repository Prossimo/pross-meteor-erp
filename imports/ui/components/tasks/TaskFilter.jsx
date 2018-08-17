import React, { Component, PropTypes } from 'react'
import styled from 'styled-components'
import Toggle from 'react-toggle'
import { ReactiveDict } from 'meteor/reactive-dict'
import 'react-toggle/style.css'


const ToggleButton = styled.label`
  padding: 0 20px;
  .react-toggle-track {
    width: 30px;
    height: 18px;
  }
  .react-toggle-thumb {
    width: 15px;
    height: 15px;
  }
  .react-toggle--checked .react-toggle-thumb {
    left: 13px;
  }
  .react-toggle {
    top: 4px;
  }
  span {
    font-size: 14px;
    padding-left: 3px;
  }
`

const formatFilterName = s => s.replace(/([A-Z])/g, ' $1').trim()

class TaskFilter extends Component {
    state = {
        filters: {
            AssignToMe: this.props.taskFilter.get('AssignToMe'),
            IamApprover: this.props.taskFilter.get('IamApprover'),
            DueDate: this.props.taskFilter.get('DueDate'),
            Today: this.props.taskFilter.get('Today'),
            Tomorrow: this.props.taskFilter.get('Tomorrow'),
        },
    }

    handleToggle = (event) => {
        const { filters } = this.state
        const { dataset: { filter }, checked } = event.currentTarget
        filters[filter] = checked
        this.props.taskFilter.set(filter, checked)
        this.setState({ filters })
    }

    render() {
        const { filters } = this.state

        return (
            <div className='col-md-12' style={{ textAlign: 'center' }}>
                {Object.keys(filters).map((filter, index) => (
                    <ToggleButton key={index}>
                        <Toggle
                            defaultChecked={filters[filter]}
                            icons={false}
                            data-filter={filter}
                            onChange={this.handleToggle} />
                        <span>{formatFilterName(filter)}</span>
                    </ToggleButton>
                ))}
            </div>
        )
    }
}

TaskFilter.propTypes = {
    taskFilter: PropTypes.instanceOf(ReactiveDict),
}

export default TaskFilter
