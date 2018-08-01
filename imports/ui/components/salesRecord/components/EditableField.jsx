import React, {Component, createElement} from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import Select from 'react-select'
import {FlowRouter} from 'meteor/kadira:flow-router'
import {FormControl, Button} from 'react-bootstrap'
import { info, warning } from '/imports/api/lib/alerts'
import {
    SUB_STAGES_LEAD,
    SUB_STAGES_OPP,
    SUB_STAGES_ORDER,
    SUB_STAGE_TICKET,
    STAGES_MAP,
} from '/imports/api/constants/project'

const LinkDiv = styled.a`
    display: block;
    color: #3379b7;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
        color: #202e54;
    }
`

const EditField = styled.div`
    padding: 0;
    box-sizing: border-box;
    outline: none !important;
    position: relative;
    height: 46px;
    margin-right: 32px
    display: flex;
    align-items: center;
    .btn {
        height: 100% !important;
        display: ${ ({edit}) => edit ? 'block' : 'none' };
        cursor: pointer;
        margin-right: -32px;
    }
    > .form-control, > .react-datepicker__input-container {
        height: 100%;
        border-radius: 0;
        padding-right: 34px;
        background-color: #fff;
        font-size: 1rem;
        background-image: none;
        border: 1px solid #ccc;
    }
    > .Select {
        .Select-control {
            border-radius: 0;
            .Select-value, .Select-placeholder {
                padding-top: 7px
            }
        }
    }
`

class DateField extends Component{
    render() {
        const { record, colDetails, handleChange } = this.props
        const value = moment(new Date(record[colDetails.key]))
        return (
            <DatePicker
                selected={value}
                onChange={(date) => handleChange(moment(date).toDate())}
            />
        )
    }
}

class SelectField extends Component{
    getSubStages = (stage) => {
        switch (stage) {
            case 'lead':
                return SUB_STAGES_LEAD
            case 'opportunity':
                return SUB_STAGES_OPP
            case 'order':
                return SUB_STAGES_ORDER
            case 'ticket':
                return SUB_STAGE_TICKET
            default:
                return []
        }
    }

    render() {
        const { record, colDetails, handleChange } = this.props
        const value = record[colDetails.key]
        let options = colDetails.options
        options = colDetails.key === 'subStage' ? this.getSubStages(record.stage) : options
        options = colDetails.key === 'stage' ? STAGES_MAP : options
        return (
            <Select
                value={value}
                options={options && typeof options === 'function'
                    ? options(record)
                    : options}
                onChange={(value) => handleChange(value.value)}
            />
        )
    }
}

class InputField extends Component{
    render() {
        const { record, colDetails, handleChange } = this.props
        const value = record[colDetails.key]
        return (
            <FormControl
                type='text'
                defaultValue={value}
                onChange={(event) => handleChange(event.target.value)}
            />
        )
    }
}

const getComponent = (type) => {
    let cmp
    switch(type) {
        case 'date': {
            cmp = DateField
            break
        }
        case 'select': {
            cmp = SelectField
            break
        }
        default: {
            cmp = InputField
        }
    }
    return cmp
}

class EditableField extends Component {
    state = {
        isEdit: false,
        record : this.props.record
    }

    handleEdit = () => {
        this.props.setEditField(this.editing)
        this.setState({
            isEdit: true
        })
    }

    handleSave = () => {
        const { record } = this.state
        Meteor.call('updateRecord', record, (error) => {
            if (error) return warning(`Problems with updating project. ${error.error}`)

            this.setState({
                isEdit: false
            })
            return info('Success update project')
        })
    }

    handleChange = (key, value) => {
        const { record } = this.state
        record[key] = value
        this.setState({ record })
    }

    renderName = ({_id, name}) => {
        return <LinkDiv onClick={() => this.goToProject(_id)}> {name} </LinkDiv>
    }

    goToProject = (id) => {
        FlowRouter.go('Deal', { id })
    }

    render() {
        const { isEdit, record } = this.state
        const { colDetails, editing } = this.props
        const canEdit = isEdit && editing == this.editing
        if (colDetails.key == 'name') {
            colDetails.renderer = this.renderName
        }
        return (
            <EditField edit={canEdit} ref={node => this.editing = node}>
                {canEdit ? createElement(getComponent(colDetails.type),
                    { record, colDetails, handleChange: (value) => this.handleChange(colDetails.key, value) })
                : colDetails.renderer ? colDetails.renderer(record) : record[colDetails.key]}

                {canEdit
                    ? <Button bsSize="small" bsStyle="warning" onClick={this.handleSave}><i className="fa fa-save" /></Button>
                    : <Button bsSize="small" bsStyle="danger" onClick={this.handleEdit}><i className="fa fa-edit" /></Button>
                }
            </EditField>
        )
    }
}

export default EditableField

/*
selectedColumns.map(({key, type, options, renderer}) => {
    if (key === this.state.edittingCell.key && index === this.state.edittingCell.rowIndex) {
        switch (type) {
            case 'date':
                return (
                    <td key={key}>
                        <div>
                            <DatePicker
                                selected={this.state.edittingCell.value}
                                onChange={this.handleChange}/> {this.renderSaveButton()}
                        </div>
                    </td>
                )
            case 'select':
                options = key === 'subStage'
                    ? this.getSubStages(project.stage)
                    : options
                options = key === 'stage'
                    ? STAGES_MAP
                    : options
                return (
                    <td key={key}>
                        <div>
                            <Select
                                style={{
                                width: '60%'
                            }}
                                value={this.state.edittingCell.value}
                                options={options && typeof options === 'function'
                                ? options(project)
                                : options}
                                onChange={this.handleChange}/> {this.renderSaveButton(key)}
                        </div>
                    </td>
                )
            default:
                return (
                    <td key={key}>
                        <div>
                            <input
                                type='text'
                                value={this.state.edittingCell.value}
                                onChange={(event) => this.handleChange(event.target.value)}/> {this.renderSaveButton()}
                        </div>
                    </td>
                )break
        }
    } else {
        switch (type) {
            case 'date':
                const date = project[key]
                    ? moment(project[key]).format('MM/DD/YYYY')
                    : ''
                return (
                    <td
                        key={key}
                        onMouseLeave={this.handleMouseLeave}
                        onMouseEnter={() => this.handleMouseEnter(key, index, moment(project[key]))}>
                        <div>
                            {date}
                            {this.renderEditButton(key, index, moment(project[key]), project._id)}
                        </div>
                    </td>
                )
            default:
                return (
                    <td
                        key={key}
                        onMouseLeave={this.handleMouseLeave}
                        onMouseEnter={() => this.handleMouseEnter(key, index, project[key])}>
                        <div>
                            {renderer && (typeof renderer === 'function')
                                ? renderer(project)
                                : project[key]}
                            {this.renderEditButton(key, index, project[key], project._id)}
                        </div>
                    </td>
                )
        }
    }
})
*/