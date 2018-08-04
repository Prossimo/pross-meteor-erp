import React, { Component } from 'react'
import { Popover, Overlay } from 'react-bootstrap'
import _ from 'underscore'

const COUNT_IN_COL = 6

class PopoverContent extends Component {
    state = {
        isEdit: false,
        options: this.props.options
    }

    renderEdit = (options) => {
        const chunked = _.chunk(options, Math.ceil(options.length / COUNT_IN_COL))
        return (
            <div className="container-fluid">
                {chunked.map((chunk, cidx) => (
                    <div className="row" key={cidx}>
                        {chunk.map((option, idx, array, colWidth = Math.ceil(12 / chunk.length)) => (
                            <div className={`col-sm-${colWidth}`} key={idx}>
                                <input type="text" defaultValue={option.label} name={`status_${option.value}`} />
                                <div className="btn btn-xs btn-danger"><i className="fa fa-remove" /></div>
                            </div>
                        ))}
                    </div>
                ))}
                <div>
                    <strong className="btn btn-block btn-success" onClick={() => this.setState({ isEdit: false })}>Apply</strong>
                </div>
            </div>
        )
    }

    renderList = (options) => {
        const { value, handleChange } = this.props
        return (
            <ul>
                {options.map((option, index) =>
                    <li key={index}>
                        <div className={`btn ${value == option.value ? 'btn-primary' : 'btn-default'} btn-block`} onClick={() => handleChange(option.value)}>
                            {option.label}
                        </div>
                    </li>
                )}
                <li>
                    <strong className="btn btn-block btn-warning" onClick={() => this.setState({isEdit: true})}>Add/Edit List Item</strong>
                </li>
            </ul>
        )
    }

    render() {
        const { options, isEdit } = this.state
        return isEdit ? this.renderEdit(options) : this.renderList(options)
    }
}

export default class SelectWithAddField extends Component{
    state = {
        show: false
    }

    handleClick = e => {
      this.setState({ target: e.target, show: !this.state.show })
    };

    render() {
        const { record, colDetails, handleChange, value } = this.props
        const ppp = {
            value,
            options: _.isFunction(colDetails.options) ? colDetails.options() : colDetails.options,
            handleChange
        }

        return (
            <div>
                <div className="btn btn-default btn-block" style={{ cursor: 'pointer' }} onClick={this.handleClick}>
                    {colDetails.renderer ? colDetails.renderer({ clientStatus: value }) : value}
                </div>
                <Overlay
                    show={this.state.show}
                    target={this.state.target}
                    placement="bottom"
                    container={this}
                >
                    <Popover id={`popover_${record._id}_${colDetails.key}`} title={colDetails.label} placement="bottom" positionTop="44px">
                        <PopoverContent {...ppp} />
                    </Popover>

                </Overlay>
            </div>
        )
    }
}