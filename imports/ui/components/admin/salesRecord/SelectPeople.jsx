import React, {Component, PropTypes} from 'react'
import Select from 'react-select'
import People from '/imports/api/models/people/people'
import { createContainer } from 'meteor/react-meteor-data'

class SelectPeople extends Component {
  constructor(props) {
    super(props)
    this.state = {
      people: [],
    }
    this.selectPeople = this.selectPeople.bind(this)
    this.selectMain = this.selectMain.bind(this)
    this.enableNotify = this.enableNotify.bind(this)
  }

  selectMain(mainId) {
    this.state.people.forEach(p => p.isMain = p._id === mainId)
    this.setState(prevState => prevState)
  }

  enableNotify(_id, checked) {
    this.state.people.forEach(p => p._id === _id && (p.notify = checked))
    this.setState(prevState => prevState)
  }

  selectPeople(people) {
    !people.find(({ isMain }) => isMain)
      && people.length
      && (people[0].isMain = true)
    this.setState({ people })
    this.props.onSelectPeople(
      people.map(({ _id, isMain, notify }) => ({
        peopleId: _id,
        isMainStakeholder: isMain,
        notify,
      }))
    )
  }

  renderMembers() {
    return (
      <table className='table table-condensed'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Main Stakeholder</th>
            <th>Notify</th>
          </tr>
        </thead>
        <tbody>
          {
            this.state.people.map(people => {
              const { _id, name, isMain, notify } = people
              return (
                <tr key={_id}>
                  <td>{ name }</td>
                  <td>
                    <div className='radio'>
                      <label>
                        <input
                          type='checkbox'
                          checked={isMain}
                          onChange={() => this.selectMain(_id)}
                        />
                      </label>
                    </div>
                  </td>
                  <td>
                    <div className='radio'>
                      <label>
                        <input
                          type='checkbox'
                          checked={notify}
                          onChange={(event) => this.enableNotify(_id, event.target.checked)}
                        />
                      </label>
                    </div>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }

  render() {
    const peopleOptions = this
      .props
      .people
      .map( people => ({ label: people.name, value: people._id, ...people }))
    return (
      <div className='panel panel-default'>
        <div className='panel-heading'>
          Add People
        </div>
        <div className='panel-body'>
          <label>People</label>
          <Select
            multi
            value={this.state.people}
            onChange={this.selectPeople}
            options={peopleOptions}
            className={'members-select'}
          />
          <div>
            { this.renderMembers() }
          </div>
        </div>
      </div>
    )
  }
}

SelectPeople.propTypes = {
  onSelectPeople: PropTypes.func.isRequired,
}

export default createContainer(() => ({
  people: People.find().fetch().map(({ name, _id }) => ({
    notify: true,
    isMain: false,
    name,
    _id,
  })),
}), SelectPeople)
