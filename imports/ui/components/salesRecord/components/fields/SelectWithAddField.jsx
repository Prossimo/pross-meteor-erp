import React, { Component } from 'react'
import { Button, Popover, OverlayTrigger} from 'react-bootstrap'

const PopoverSelect = ({label, value, options}) => (
    <Popover id="popover-positioned-bottom" title={label} placement="bottom" positionTop="44px">
        <ul>
            {options.map(({name, _id}) =>
                <li key={_id} data-value={_id}>
                    {value == _id ? 'Selected:' : null}
                    {name}
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