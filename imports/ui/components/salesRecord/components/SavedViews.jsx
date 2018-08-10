import React, { Component } from 'react'
import { Modal, Dropdown, Button, MenuItem, Glyphicon } from 'react-bootstrap'
import { InputGroup, FormControl } from 'react-bootstrap'
import store from '/imports/redux/store'
import { setParams, dealsParams } from '/imports/redux/actions'
import _ from 'underscore'

class SavedViews extends Component {
    state = {
        showModal: false,
        newStateName: '',
        states: [],
        activeState: {}
    }

    componentDidMount() {
        this.getStates()
        this.unsubscribeState = store.subscribe(this.resetActiveState)
    }

    componentWillUnmount() {
        this.unsubscribeState()
    }

    resetActiveState = () => {
        const { activeState: { params } } = this.state
        const { dealsParams } = store.getState()
        if (params && !_.isMatch(params, dealsParams)) {
            this.setState({ activeState: {} })
        }
    }

    getStates = () => {
        Meteor.call('users.dealsState.list', (err, states) => {
            this.setState({ states })
        })
    }

    newStateName = (event, data) => {
        const newStateName = event.currentTarget.value
        this.setState({ newStateName })
    }

    saveNew = () => {
        const { newStateName } = this.state
        const { dealsParams = {} } = store.getState()
        const dealStateNewParams = {
            name: newStateName,
            params: dealsParams
        }
        if (newStateName) {
            Meteor.call('users.dealsState.new', dealStateNewParams, (err, res = {}) => {
                if (err) {
                    throw new Meteor.Error(err)
                }
                const { states, newState } = res
                this.setState({ states, newStateName: '' })
            })
        }
    }

    applyState = (state) => {
        const { name, params } = state
        // this.set dropdown label = name
        // apply params to list
        this.setState({
            showModal: false,
            activeState: state
        })
        store.dispatch(setParams(params))
    }

    selectState = (event) => {
        const state = _.find(this.state.states, { id: event.currentTarget.dataset.stateid })
        if (state) {
            this.applyState(state)
        }
    }

    openModal = () => {
        this.setState({ showModal: true })
    }

    closeModal = () => {
        this.setState({ showModal: false })
    }

    removeState = (id) => {
        const { states } = this.state
        Meteor.call('users.dealsState.remove', id, (err, res) => {
            if (err) {
                throw new Meteor.Error(err)
            }

            const dropId = _.findIndex(states, { id: res.id })
            this.setState({
                states: [].concat(
                    states.slice(0, dropId),
                    states.slice(1 + dropId)
                )
            })
        })
    }

    render() {
        const { showModal, states, newStateName, activeState } = this.state

        return (
            <div>
                <Dropdown id="saved-views">
                    <Dropdown.Toggle>
                        {activeState.name || 'Select saved state'}
                    </Dropdown.Toggle>
                    <Button bsStyle="info"
                        onClick={this.openModal}><Glyphicon glyph="plus" /></Button>
                    <Dropdown.Menu>
                        {states.map((state, index) => (
                            <MenuItem active={state.id === activeState.id} {...{ 'data-stateid': state.id }} key={index} onClick={this.selectState}>{state.name}</MenuItem>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header>
                        <Modal.Title>Select view    </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <ul>
                            {states.map((state, index) => (
                                <li key={index}>
                                    <a href="#apply-state" onClick={(event) => { event.preventDefault(); return this.applyState(state) }}>{state.name}</a>
                                    <span data-id={state.id} className="badge badge-danger" onClick={(event) => { event.preventDefault(); return this.removeState(state.id) }}>
                                        <Glyphicon glyph="remove" />
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <InputGroup>
                            <FormControl type="text" placeholder="Enter new state..." onChange={this.newStateName} ref={node => this.input = node} value={newStateName} />
                            <InputGroup.Addon onClick={this.saveNew}><i className="fa fa-plus" /></InputGroup.Addon>
                        </InputGroup>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default SavedViews
