import React, {PropTypes} from 'react'
import {InputGroup, FormControl, Button} from 'react-bootstrap'
import Actions from '/imports/api/nylas/actions'

export default class MailSearchBox extends React.Component {
    static propTypes = {
        onSearch: PropTypes.func
    }
    constructor(props) {
        super(props)

        this.state = {
            searched: false,
            keyword: ''
        }
    }

    onChangeKeyword = (evt) => {
        const keyword = evt.target.value
        this.setState({keyword})
    }
    onClickSearch = () => {
        const {keyword} = this.state
        if(keyword && keyword.length) {
            this.setState({searched: true}, () => {
                Actions.searchThreads(keyword)
            })
        }
    }
    onClickClear = () => {
        this.setState({searched:false, keyword:''}, () => {
            Actions.searchThreads('')
        })
    }

    render() {
        const {searched} = this.state
        return (
            <InputGroup>
                <FormControl type="text" value={this.state.keyword} placeholder="Input search keyword..." onChange={this.onChangeKeyword} />
                <InputGroup.Button>
                    {!searched && <Button onClick={this.onClickSearch}><i className="fa fa-search"/></Button>}
                    {searched && <Button onClick={this.onClickClear}>×</Button>}
                </InputGroup.Button>
            </InputGroup>
        )
    }
}