import React from 'react'
import {InputGroup, FormControl} from 'react-bootstrap'

export default class SearchInput extends React.Component {
    onChangeInput = (e) => {
        if(this.props.onChange) this.props.onChange(e.target.value)
    }
    render() {
        return (
            <InputGroup>
                <InputGroup.Addon><i className="fa fa-search"/></InputGroup.Addon>
                <FormControl type="text" placeholder="Search..." onChange={this.onChangeInput} />
            </InputGroup>
        )
    }
}