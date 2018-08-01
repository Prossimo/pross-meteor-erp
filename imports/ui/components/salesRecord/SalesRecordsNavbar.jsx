import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { Checkbox } from 'react-bootstrap'
import { Modal } from 'react-bootstrap'
import {Navbar, Container} from '/imports/ui/styled'
import CreateSalesRecord from '/imports/ui/components/salesRecord/CreateSalesRecord'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.min.css'
import { SearchInput } from '../../components/common'
import * as columnsDetails from './columnsDetails'

class SalesRecordsNavbar extends Component {
    state = {
        showModal: false
    }

    static defaultProps = {
        columns: [],
        showArchivedDeals: false,
        groupBySubstage: false
    }

    componentDidMount() {
        const { columns, handleCols } = this.props

        $(this.selectCols).selectpicker({
            style: 'btn-default',
            size: 4
        })
        $(this.selectCols).selectpicker('val', columns)

        $(this.selectCols).on('changed.bs.select', function () {
            const selectedKeys = $(this).val()
            Meteor.call('updateVisibleFields', 'salesRecord', selectedKeys, (err, res) => {
                handleCols(selectedKeys)
            })
        })
    }

    renderColumnsSelect = () => {
        return (
            <select multiple ref={node => this.selectCols = node}>
                {Object.keys(columnsDetails).map(( key ) =>
                    <option value={key} key={key}>{columnsDetails[key].label}</option>)}
            </select>
        )
    }

    toggleGroupBy = (event) => {
        this.props.toggleGroupBy(event.currentTarget.checked)
    }

    toggleShowArchive = (event) => {
        this.props.toggleShowArchive(event.currentTarget.checked)
    }

    renderModal = (props) => {
        const { showModal } = this.state
        return (
            <Modal show={showModal} onHide={() => {
                this.setState({ showModal: false })
            }} bsSize="large">
                <Modal.Header closeButton><Modal.Title>Create Deal</Modal.Title></Modal.Header>
                <Modal.Body>
                    <CreateSalesRecord {...props} />
                </Modal.Body>
            </Modal>
        )
    }

    render() {
        const {
            title,
            showArchivedDeals,
            groupBySubstage,
            onChangeSearch,
            modalProps
        } = this.props

        return (
            <Navbar>
                <Container fluid>
                    <Navbar.Header>
                        <Navbar.Brand>
                            {title}
                        </Navbar.Brand>
                    </Navbar.Header>
                    <Navbar.Text>
                        <button
                            className="btn btn-primary"
                            onClick={() => this.setState({ showModal: true })}
                        >
                            <span className="fa fa-plus"></span> Add Deal
                        </button>
                    </Navbar.Text>
                    <Navbar.Text>
                        <Checkbox checked={showArchivedDeals} onChange={this.toggleShowArchive}>
                            Show Archived Deals
                        </Checkbox>
                    </Navbar.Text>
                    <Navbar.Text>
                        <Checkbox onChange={this.toggleGroupBy}>
                            Group by sub stage
                        </Checkbox>
                    </Navbar.Text>
                    <Navbar.Nav navbarRight>
                        <Navbar.Text style={{ width: 250 }}>
                            <SearchInput onChange={onChangeSearch} />
                        </Navbar.Text>
                        <Navbar.Text>
                            {this.renderColumnsSelect()}
                        </Navbar.Text>
                    </Navbar.Nav>
                </Container>
                {this.renderModal(modalProps)}
            </Navbar>
        )
    }
}

export default SalesRecordsNavbar