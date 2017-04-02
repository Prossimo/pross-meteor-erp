import React, {Component, PropTypes} from 'react';
import Select from 'react-select';
import {
    DESIGNATION_LIST,
    STAKEHOLDER_CATEGORY
} from '/imports/api/constants/project';

class SelectStakeHolders extends Component {
    static propTypes = {
        members: PropTypes.array.isRequired,
        selectedMembers: PropTypes.array,
        onSelectStakeholders: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {}

        this.changeMembers = this.changeMembers.bind(this);
        this.renderMembers = this.renderMembers.bind(this);
        this.changeState = this.changeState.bind(this);
        this.categoryOptions = STAKEHOLDER_CATEGORY.map((category) => ({label: category, value: category}));
        this.designationOptions = DESIGNATION_LIST.map((designation) => ({label: designation, value: designation}));

        const selectedMembers = this.getConvertedSelectedMembers(props.selectedMembers?props.selectedMembers.map(({name, email, _id}) => ({label: name, value: _id, email: email})):[])
        this.state = {
            selectedMembers: selectedMembers
        }

        props.onSelectStakeholders && props.onSelectStakeholders(selectedMembers.map(({label, value, isMainStakeholder, designation, categories}) => ({
            contactId: value,
            destination: designation.value,
            isMainStakeholder,
            category: categories.map(({label, value}) => value),
        })));
    }

    changeState(propName, item, propValue) {
        if (propName === 'isMainStakeholder') {
            this.state.selectedMembers.forEach((member) => {
                member.isMainStakeholder = false;
            });
            item[propName] = true;
        } else {
            item[propName] = propValue;
        }
        this.setState({
            selectedMembers: this.state.selectedMembers,
        });
        this.props.onSelectStakeholders(this.state.selectedMembers.map(({label, value, isMainStakeholder, designation, categories}) => ({
            contactId: value,
            destination: designation.value,
            isMainStakeholder,
            category: categories.map(({label, value}) => value),
        })));
    }

    changeMembers(selectedMembers) {
        selectedMembers = this.getConvertedSelectedMembers(selectedMembers)
        this.setState({selectedMembers: selectedMembers})

        this.props.onSelectStakeholders(selectedMembers.map(({label, value, isMainStakeholder, designation, categories}) => ({
            contactId: value,
            destination: designation.value,
            isMainStakeholder,
            category: categories.map(({label, value}) => value),
        })));
    }

    getConvertedSelectedMembers = (selectedMembers) => {
        if (!selectedMembers || selectedMembers.length == 0) return []
        selectedMembers.forEach((member) => {
            const {designation, categories, isMainStakeholder} = member;
            if (_.isUndefined(designation) || _.isUndefined(categories) || _.isUndefined(isMainStakeholder)) {
                member.designation = this.designationOptions[0];
                member.categories = [this.categoryOptions[0]];
                member.isMainStakeholder = false;
            }
        });
        // has checked
        const hasChecked = selectedMembers.reduce((result, {isMainStakeholder}) => !!isMainStakeholder || result, false);
        if (!hasChecked && selectedMembers.length > 0) selectedMembers[0].isMainStakeholder = true;

        return selectedMembers
    }

    renderMembers() {
        return (
            <table className='table table-condensed'>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Main Stakeholder</th>
                    <th>Designation</th>
                    <th>Category</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.state.selectedMembers.map((selectedMember) => {
                        let {label, value, email, designation, categories, isMainStakeholder} = selectedMember;
                        return (
                            <tr key={value}>
                                <td><div>{ label }</div><div style={{fontSize:12,color:'gray',paddingLeft:5 }}>{email}</div></td>
                                <td>
                                    <div className='radio'>
                                        <label><input type='checkbox' checked={isMainStakeholder}
                                                      onChange={(event) => this.changeState('isMainStakeholder', selectedMember, event.target.checked) }/></label>
                                    </div>
                                </td>
                                <td>
                                    <Select
                                        options={this.designationOptions}
                                        value={designation}
                                        onChange={(selectedDesignation) => {
                                            this.changeState('designation', selectedMember, selectedDesignation)
                                        }}
                                        clearable={false}
                                    />
                                </td>
                                <td>
                                    <Select
                                        multi
                                        options={this.categoryOptions}
                                        value={categories}
                                        onChange={(selectedCatogories) => {
                                            this.changeState('categories', selectedMember, selectedCatogories)
                                        }}
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
        const memberOptions = this.props.members.map(({name, email, _id}) => ({label: name, value: _id, email: email}));
        return (
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    Add Stakeholders
                </div>
                <div className='panel-body'>
                    <label>Stakeholders</label>
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


export default SelectStakeHolders;
