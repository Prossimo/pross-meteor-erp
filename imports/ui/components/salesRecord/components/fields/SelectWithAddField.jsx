import React, { Component } from 'react'
import { Button, Popover, OverlayTrigger} from 'react-bootstrap'

const PopoverSelect = ({label, value, options}) => (
    <Popover id="popover-positioned-bottom" title={label} placement="bottom" positionTop="44px">
        <ul>
            {options.map(({label, value}, index) =>
                <li key={index} data-value={value}>
                    {value == value ? 'Selected:' : null}
                    {label}
                </li>
            )}
        </ul>
        <strong>Add/Edit List Item</strong>
    </Popover>
)

export default class SelectWithAddField extends Component{
    render() {
        const { record, colDetails, handleChange } = this.props
        const ppp = {
            value: record[colDetails.key],
            options: _.isFunction(colDetails.options) ? colDetails.options() : colDetails.options,
            label: colDetails.label
        }
        console.log('ppp', ppp)
        return <OverlayTrigger
            style={{cursor: 'pointer'}}
            container={this}
            trigger="click"
            placement="bottom"
            overlay={<PopoverSelect { ...ppp} />}
        >
            <div>
                {colDetails.rendered ? colDetails.renderer(ppp.value) : ppp.value}
            </div>
        </OverlayTrigger>
    }
}