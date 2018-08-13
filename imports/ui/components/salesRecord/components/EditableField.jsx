import React, {Component, createElement} from 'react'
import styled from 'styled-components'
import { Button } from 'react-bootstrap'
import getComponent from './fields'

const EditField = styled.div`
    padding: 0;
    box-sizing: border-box;
    outline: none !important;
    position: relative;
    min-height: 46px;
    margin-right: 32px
    display: flex;
    align-items: center;
    > .btn {
        height: 100% !important;
        display: ${ ({edit}) => edit ? 'block' : 'none' };
        cursor: pointer;
        margin-right: -32px;
    }
    > .form-control, .react-datepicker__input-container, > .Select .Select-control {
        height: 100%;
        border-radius: 0;
        padding-right: 34px;
        background-color: #fff;
        font-size: 1rem;
        background-image: none;
        border: 1px solid #ccc;
        line-height: 44px;
    }
    > .Select {
        width: 100%;
        min-width: 10rem;
        height: 100%;
        .Select-control {
            border-radius: 0;
            padding-right: unset;
            .Select-placeholder, .Select-value{
                line-height: 44px;
            }
        }
    }
`

class EditableField extends Component {
    state = {
        value: this.props.record[this.props.colDetails.key],
        isEdit: this.props.editing
    }

    handleEdit = () => {
        this.props.setEditField(this.editing)
        this.setState({
            isEdit: true
        })
    }

    handleChange = (value) => {
        this.setState({ value })
    }

    handleSave = () => {
        const { colDetails, handleSave } = this.props
        const { value } = this.state
        handleSave({key: colDetails.key, value})
    }

    render() {
        const { isEdit, value } = this.state
        const { record, colDetails, editing } = this.props
        const canEdit = isEdit && editing == this.editing
        return (
            <EditField edit={canEdit} ref={node => this.editing = node}>
                {canEdit ? createElement(getComponent(colDetails.type),
                    { record, colDetails, handleChange: this.handleChange, value })
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
