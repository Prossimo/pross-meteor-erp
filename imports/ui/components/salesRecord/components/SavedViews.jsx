import React, { Component } from 'react'
import { Modal, Dropdown, Button, MenuItem, Glyphicon } from 'react-bootstrap'
import { InputGroup, FormControl } from 'react-bootstrap'
import store from '/imports/redux/store'
import { setParams, dealsParams } from '/imports/redux/actions'
import _ from 'underscore'
import {DealsDefaultState} from '/imports/redux/reducers/dealsParams'

class SavedViews extends Component {
    state = {
        showModal: false,
        newStateName: '',
        states: [],
        activeStateId: null
    }

    componentDidMount() {
        this.getStates()
        // this.unsubscribeState = store.subscribe(this.resetActiveState)
    }

    componentWillUnmount() {
        // this.unsubscribeState()
    }

    resetActiveState = () => {
        // const { activeStateId } = this.state
        // const { params } = activeState
        // const { dealsParams } = store.getState()
        // console.log('resetActiveState', params, dealsParams, _.isMatch(params, dealsParams));
        // if (params && !_.isMatch(params, dealsParams)) {
        //     this.setState({ activeState: {} })
        // }
    }

    getStates = () => {
        Meteor.call('users.dealsState.list', (err, states) => {
            const statesWithDefault = _.clone(states)
            statesWithDefault.unshift({
                id: 'default_state',
                name: 'Default State',
                params: DealsDefaultState
            })
            this.setState({ states: statesWithDefault })
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
        const { id, params } = state
        // this.set dropdown label = name
        // apply params to list
        this.setState({
            showModal: false,
            activeStateId: state.id
        })
        store.dispatch(setParams(params))

        const tableContainer = document.getElementById('tableContainer')
        if (tableContainer && params.scrollTop) {
            tableContainer.scrollTop = params.scrollTop
        }
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
        const { showModal, states, newStateName, activeStateId } = this.state
        const activeState = states.find(({id}) => activeStateId == id)

        return (
            <div>
                <Dropdown id="saved-views">
                    <Dropdown.Toggle>
                        {activeState ? activeState.name : 'Select saved state'}
                    </Dropdown.Toggle>
                    <Button bsStyle="info"
                        onClick={this.openModal}><Glyphicon glyph="plus" /></Button>
                    <Dropdown.Menu>
                        {states.map((state, index) => (
                            <MenuItem active={state.id === activeStateId} {...{ 'data-stateid': state.id }} key={index} onClick={this.selectState}>{state.name}</MenuItem>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header>
                        <Modal.Title>Select view    </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <ul>
                            {_.clone(states).slice(1).map((state, index) => (
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
