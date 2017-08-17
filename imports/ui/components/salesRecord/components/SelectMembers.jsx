import _ from 'underscore'
import {Roles} from 'meteor/alanning:roles'
import React, { Component, PropTypes } from 'react'
import Select from 'react-select'
import {Users, ROLES, USER_STATUS} from '/imports/api/models'

export default class SelectMembers extends Component{
    static propTypes = {
        members: PropTypes.array,
        onSelectMembers: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)


        const selectedMembers = props.members ? Users.find({_id:{$in:props.members}}).map(u => ({
            label: u.name(),
            value: u._id,
            username: u.username,
            roles: u.roles.join(', ')
        })) : [
            {
                label: Meteor.user().name(),
                value: Meteor.userId(),
                username: Meteor.user().username,
                roles: Meteor.user().roles.join(', ')
            }
        ]
        this.state = {
          selectedMembers
        }

        if(this.props.onSelectMembers) {
            this.props.onSelectMembers(_.pluck(selectedMembers, 'value'))
        }
    }

    changeMembers = (selectedMembers) => {
        this.setState({ selectedMembers})
        this.props.onSelectMembers(_.pluck(selectedMembers, 'value'))
    }

    renderMembers() {
        return (
            <table className='table table-condensed'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.selectedMembers.map((member) => {
                            const { label, value, username, roles } = member
                            return (
                                <tr key={value}>
                                    <td>{ label }</td>
                                    <td>{ username }</td>
                                    <td>{ roles }</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }

    render() {
        const members = Users.find().fetch().filter(({_id, status, slack}) => Roles.userIsInRole(_id, [ROLES.ADMIN, ROLES.SALES]) && status === USER_STATUS.ACTIVE && slack)
        const memberOptions = members.map(member => ({ label: member.name(), value: member._id, username: member.username, roles:member.roles.join(',') }))
        return (
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    Add Members
                </div>
                <div className='panel-body'>
                    <label>Members</label>
                    <Select
                        multi
                        value={this.state.selectedMembers}
                        onChange={this.changeMembers}
                        options={memberOptions}
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


