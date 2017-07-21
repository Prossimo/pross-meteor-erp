import React, {PropTypes} from 'react'
import {Table, Checkbox} from 'react-bootstrap'

export default class ParticipantsSelector extends React.Component {
    static propTypes = {
        participants: PropTypes.array,  // people document array
        selections: PropTypes.array,    // people document._id array
        onChange: PropTypes.func
    }
    constructor(props) {
        super(props)

        this.state = {
            selections: props.selections || []
        }

    }

    selectParticipant = (p, selected) => {
        const { selections } = this.state

        const index = selections.indexOf(p._id)
        if(selected && index == -1) {
            selections.push(p._id)
        } else if(!selected && index > -1) {
            selections.splice(index, 1)
        }

        this.setState({ selections })

        if(this.props.onChange && typeof this.props.onChange === 'function') this.props.onChange(selections)
    }

    render() {
        const {participants} = this.props
        const {selections} = this.state

        return (
            <Table bordered condensed hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                </tr>
                </thead>
                <tbody>
                {
                    participants.map(p => (
                        <tr key={p._id}>
                            <td><Checkbox onChange={(e) => {this.selectParticipant(p, e.target.checked)}} checked={selections.indexOf(p._id) > -1}/></td>
                            <td>{p.name}</td>
                            <td>{p.defaultEmail()}</td>
                            <td>{`${p.designation().name}/${p.role}`}</td>
                        </tr>
                    ))
                }
                </tbody>
            </Table>
        )
    }
}