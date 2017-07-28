import _ from 'underscore'
import {Meteor} from 'meteor/meteor'
import React, {PropTypes} from 'react'
import {Dropdown, MenuItem, FormControl} from 'react-bootstrap'
import CustomToggle from './CustomToggle'

export default class MemberSelector extends React.Component {
    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.object,PropTypes.array]), // Selected channel id
        multiple: PropTypes.bool,
        onSelect: PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            options: props.options,
            value: props.value
        }
    }

    componentDidMount() {

    }

    onChangeSearch = (evt) => {
        if(this.searchTimeout) { clearTimeout(this.searchTimeout) }

        const keyword = evt.target.value
        this.searchTimeout = setTimeout(() => {
            if(keyword.length) {
                this.setState({options: this.props.options.filter(o => o.label.toLowerCase().indexOf(keyword.toLowerCase()) > -1)})
            } else {
                this.setState({options: this.props.options})
            }
        }, 500)
    }

    onSelectItem = (item) => {
        const {value} = this.state

        if(this.props.multiple) {
            const index = _.pluck(value, 'value').indexOf(item.value)
            if(index > -1) value.splice(index, 1)
            else value.push(item)

            this.setState({value})
        } else {
            if(value.value == item.value) this.setState({value:null})
            else this.setState({value:item})
        }

    }

    onToggle = (isOpen, evt) => {
        if(!isOpen) {
            if(this.props.onSelect) this.props.onSelect(this.state.value)
        }
    }
    renderItems() {
        const {options, value} = this.state

        return (
            <table>
                <tbody>
                {
                    options.map((o, i) => (
                        <tr key={i} onClick={() => this.onSelectItem(o)}>
                            <td>{value&&(this.props.multiple ? _.pluck(value, 'value').indexOf(o.value)>-1 : value.value == o.value) ? <i className="fa fa-check"/> : <span style={{width:12,height:12}}>&nbsp;</span> }</td>
                            <td>{o.label}</td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        )
    }
    renderMenu() {
        const {options, value} = this.state

        return (
            <Dropdown.Menu className="selector-menu">
                <MenuItem header className="item">
                    <FormControl type="text" placeholder="Type to filter..." onChange={this.onChangeSearch}/>
                </MenuItem>
                <MenuItem header className="item body">
                    {this.renderItems()}
                </MenuItem>
            </Dropdown.Menu>
        )
    }
    render() {

        return (
            <Dropdown id="dropdown-custom-menu" pullRight onToggle={this.onToggle}>
                <CustomToggle bsRole="toggle">
                    <i className="fa fa-cog"/>
                </CustomToggle>

                {this.renderMenu()}
            </Dropdown>
        )
    }
}