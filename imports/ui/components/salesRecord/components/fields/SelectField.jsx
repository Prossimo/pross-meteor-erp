import React, { Component } from 'react'
import Select from 'react-select'

export default class SelectField extends Component{
    state = {
        value: this.props.record[this.props.colDetails.key]
    }

    handleChange = ({value}) => {
        const {handleChange} = this.props
        this.setState({value})
        handleChange(value)
    }

    render() {
        const { record, colDetails: { options } } = this.props
        const { value } = this.state
        const selectOptions = _.isFunction(options) ? options(record) : options

        return (
            <Select
                value={value}
                options={selectOptions}
                onChange={this.handleChange}
            />
        )
    }
}
