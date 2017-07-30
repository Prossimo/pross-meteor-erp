import _ from 'underscore'
import {Meteor} from 'meteor/meteor'
import React, {PropTypes} from 'react'
import {Dropdown, MenuItem, FormControl} from 'react-bootstrap'
import CustomToggle from './CustomToggle'

export default class SlackChannelSelector extends React.Component {
    static propTypes = {
        channel: PropTypes.string, // Selected channel id
        onSelectChannel: PropTypes.func
    }

    constructor(props) {
        super(props)

        this.channels = []
        this.state = {
            channels: []
        }
    }

    componentDidMount() {
        this.setState({loading: true})
        Meteor.call('getSlackChannels', (err, channels) => {
            if (err) return console.warn(err)

            this.channels = channels
            this.setState({channels, loading: false})
        })
    }

    onChangeSearch = (evt) => {
        if(this.searchTimeout) { clearTimeout(this.searchTimeout) }

        const keyword = evt.target.value
        this.searchTimeout = setTimeout(() => {
            if(keyword.length) {
                this.setState({channels: this.channels.filter(c => c.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1)})
            } else {
                this.setState({channels: this.channels})
            }
        }, 500)
    }

    onSelectMenu = (c) => {
        if(this.props.onSelectChannel) this.props.onSelectChannel(c)
    }
    renderItems() {
        const {channels} = this.state
        const {channel} = this.props

        return (
            <table>
                <tbody>
                {
                    channels.map((c, i) => (
                        <tr key={i} onClick={() => this.onSelectMenu(c)}>
                            <td>{channel==c.id ? <i className="fa fa-check"/> : <span style={{width:12,height:12}}>&nbsp;</span> }</td>
                            <td>{c.name}</td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        )
    }
    renderMenu() {
        const {loading} = this.state

        if(loading) {
            return (
                <Dropdown.Menu>
                    <i className="fa fa-spinner fa-spin fa-fw"/>
                </Dropdown.Menu>
            )
        } else {
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
    }
    render() {

        return (
            <Dropdown id="dropdown-custom-menu" pullRight>
                <CustomToggle bsRole="toggle">
                    <i className="fa fa-cog"/>
                </CustomToggle>

                {this.renderMenu()}
            </Dropdown>
        )
    }
}