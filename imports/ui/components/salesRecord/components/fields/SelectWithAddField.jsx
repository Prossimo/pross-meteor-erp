import React, { Component } from 'react'
import Select from 'react-select'
import { Button, Popover, OverlayTrigger} from 'react-bootstrap'

const PopoverSelect = ({label, value, options}) => (
    <Popover id="popover-positioned-bottom" title={label}>
        <ul>
            {options.map(({name, _id}) => {
                <li key={_id} data-value={_id}>
                    {value == _id ? 'Selected:' : null}
                    {name}
                </li>
            })}
        </ul>
        <strong>Add/Edit List Item</strong>
    </Popover>
)

class SelectWithAddField extends Component{
    render() {
        const { record, colDetails, handleChange } = this.props
        const popoverProps ={
            value: record[colDetails.key],
            options: _.isFunction(colDetails.options) ? colDetails.options() : colDetails.options,
            label: colDetails.label
        }
        console.log('popoverProps', popoverProps)
        return <OverlayTrigger
            container={this}
            trigger="click"
            placement="bottom"
            overlay={<PopoverSelect { ...popoverProps} />}
        >
            <Button style={{width: '100%'}}>+ {popoverProps.value}</Button>
        </OverlayTrigger>
    }
}