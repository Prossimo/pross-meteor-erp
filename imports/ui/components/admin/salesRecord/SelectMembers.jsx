import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import { getUserName } from '/imports/api/lib/filters';
import {
    DESIGNATION_LIST,
    STAKEHOLDER_CATEGORY
} from '/imports/api/constants/project';

class SelectMembers extends Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedMembers: [],
        }
        this.changeMembers = this.changeMembers.bind(this);
        this.renderMembers = this.renderMembers.bind(this);
        this.changeState = this.changeState.bind(this);
        this.categoryOptions = STAKEHOLDER_CATEGORY.map((category)=> ({label: category, value: category}));
        this.designationOptions = DESIGNATION_LIST.map((designation)=> ({label: designation, value: designation}));
    }

    changeState(propName, item, propValue) {
        item[propName] = propValue;
        this.setState({
            selectedMembers: this.state.selectedMembers,
        });
    }

    changeMembers(selectedMembers) {
        selectedMembers.forEach((member)=> {
            const { designation, categories, isMainStakeholder } = member;
            if (_.isUndefined(designation) || _.isUndefined(categories) || _.isUndefined(isMainStakeholder)) {
                member.designation = this.designationOptions[0];
                member.categories = [this.categoryOptions[0]];
            }
        });
        this.setState({ selectedMembers});
    }

    renderMembers() {
        return (
            <table className='table table-condensed'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.selectedMembers.map((selectedMember)=> {
                            const { label, value, designation, categories } = selectedMember;
                            return (
                                <tr key={value}>
                                    <td>{ label }</td>
                                    <td>
                                        <Select
                                            options={this.designationOptions}
                                            value={designation}
                                            onChange={(selectedDesignation)=> { this.changeState('designation', selectedMember, selectedDesignation)}}
                                            clearable={false}
                                        />
                                    </td>
                                    <td>
                                        <Select
                                            multi
                                            options={this.categoryOptions}
                                            value={categories}
                                            onChange={(selectedCatogories)=> { this.changeState('categories', selectedMember, selectedCatogories) }}
                                            clearable={false}
                                        />
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        );
    }

    render() {
        const memberOptions = this.props.members.map(member => ({ label: getUserName(member, true), value: member._id }));
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

SelectMembers.propTypes = {
    members: PropTypes.array.isRequired,
}
export default SelectMembers;
