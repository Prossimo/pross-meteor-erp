import React, { Component } from 'react'
import { Glyphicon, MenuItem, Dropdown, Modal, InputGroup, FormControl, Button } from 'react-bootstrap'
import _ from 'underscore'

export default class SelectWithAddField extends Component {
    state = {
        value: this.props.record[this.props.colDetails.key],
        showModal: false
    }

    saveNew = () => {
        const value = this.input.value

        const { colDetails: { key }, handleChange } = this.props
        Meteor.call('list.new', { key, value }, (err, res) => {
            this.input.value = ''
            this.setState({ value: res })
            handleChange(res)
        })
    }

    updateStatus = (event) => {
        event.target.classList.add('edited')
        if (event.which == 13 || event.keyCode == 13) {
            const value = event.target.dataset.value
            const label = event.target.value

            event.target.classList.remove('edited')
            const { colDetails: { key }, handleChange } = this.props
            Meteor.call('list.update', { key, item: { value, label } }, (err, res) => {
                /** @todo check then field was updated in iput and in list for select */
                if (res) {
                    this.setState({ value })
                    handleChange(value)
                }

            })
        }
    }

    delStatus = (value) => {
        const { colDetails: { key }, handleChange } = this.props
        Meteor.call('list.del', { key, value }, (err, res) => {
            /** @todo check then field was removed */
            if (res) {
                this.setState({ value: '' })
                handleChange('')
            }
        })
    }

    handleChange = (event) => {
        const { handleChange } = this.props
        const value = event.target.dataset.value
        this.setState({ value })
        handleChange(value)
    }

    openModal = () => {
        this.setState({ showModal: true })
    }

    closeModal = () => {
        this.setState({ showModal: false })
    }

    renderSelectInput = ({ value, label }, index) => (
        <li key={index}>
            <InputGroup>
                <FormControl type="text" placeholder="Enter status..." {...{ 'data-value': value }} defaultValue={label} onKeyPress={this.updateStatus} onChange={this.setEditState} />
                <InputGroup.Addon onClick={() => this.delStatus(value)}><i className="fa fa-minus" /></InputGroup.Addon>
            </InputGroup>
        </li>
    )

    renderModal = (colOptions) => {
        const { showModal } = this.state
        return (
            <Modal show={showModal} onHide={this.closeModal}>
                <Modal.Header>
                    <Modal.Title>Edit statuses</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <ul ref={node => this.inputsList = node}>
                        {colOptions.map(this.renderSelectInput)}
                    </ul>
                    <InputGroup>
                        <FormControl type="text" placeholder="Enter new status..." inputRef={node => this.input = node} />
                        <InputGroup.Addon onClick={this.saveNew}><i className="fa fa-plus" /></InputGroup.Addon>
                    </InputGroup>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    render() {
        const { record, colDetails: { key, options } } = this.props
        const { value } = this.state
        const colOptions = _.isFunction(options) ? options() : options
        const current = _.findWhere(colOptions, { value }) || {}
        return (
            <div>
                <Dropdown id={`${key}-${record._id}`}>
                    <Dropdown.Toggle>
                        {current.label || 'Select status'}
                    </Dropdown.Toggle>
                    <Button bsStyle="info"
                        onClick={this.openModal}><Glyphicon glyph="plus" /></Button>
                    <Dropdown.Menu>
                        {colOptions.map((option, index) => (
                            <MenuItem active={option.value === value} {...{ 'data-value': option.value }} key={index} onClick={this.handleChange}>{option.label}</MenuItem>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                {this.renderModal(colOptions)}
            </div>
        )
    }
}
