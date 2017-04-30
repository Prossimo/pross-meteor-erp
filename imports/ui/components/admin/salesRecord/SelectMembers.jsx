import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import { getUserName } from '/imports/api/lib/filters';
import {
    STAKEHOLDER_CATEGORY
} from '/imports/api/constants/project';

class SelectMembers extends Component{
    constructor(props) {
        super(props);
        this.changeMembers = this.changeMembers.bind(this);
        this.renderMembers = this.renderMembers.bind(this);
        this.changeState = this.changeState.bind(this);
        this.categoryOptions = STAKEHOLDER_CATEGORY.map((category)=> ({label: category, value: category}));

        const selectedMembers = [
            {
                label: getUserName(Meteor.user(), true),
                value: Meteor.userId(),
                categories: [this.categoryOptions[0]],
            }
        ]
        this.state = {
          selectedMembers
        }

        if(this.props.onSelectMembers) {
            this.props.onSelectMembers(selectedMembers.map(({ label, value, categories })=> ({
                userId: value,
                category: categories.map(({ label, value })=> value),
            })));
        }
    }

    changeState(propName, item, propValue) {
        item[propName] = propValue;
        this.setState({
            selectedMembers: this.state.selectedMembers,
        });
        this.props.onSelectMembers(this.state.selectedMembers.map(({ label, value, categories })=> ({
            userId: value,
            category: categories.map(({ label, value })=> value),
        })));
    }

    changeMembers(selectedMembers) {
        selectedMembers.forEach((member)=> {
            const { categories, isMainStakeholder } = member;
            if (_.isUndefined(categories) || _.isUndefined(isMainStakeholder)) {
                member.categories = [this.categoryOptions[0]];
            }
        });
        this.setState({ selectedMembers});
        this.props.onSelectMembers(selectedMembers.map(({ label, value, categories })=> ({
            userId: value,
            category: categories.map(({ label, value })=> value),
        })));
    }

    renderMembers() {
        return (
            <table className='table table-condensed'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.selectedMembers.map((selectedMember)=> {
                            const { label, value, categories } = selectedMember;
                            return (
                                <tr key={value}>
                                    <td>{ label }</td>
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
    onSelectMembers: PropTypes.func.isRequired,
}
export default SelectMembers;
