import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Checkbox } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import _ from "underscore";
import store from "/imports/redux/store";
import { setParam } from "/imports/redux/actions";
import { Navbar, Container } from "/imports/ui/styled";
import CreateSalesRecord from "/imports/ui/components/salesRecord/CreateSalesRecord";
import { SearchInput } from "../common";
import * as columnsDetails from "./columnsDetails";
import SavedViews from "./components/SavedViews";
import { DEALS } from "/imports/utils/constants";

class SalesRecordsNavbar extends Component {
  state = {
    showModal: false
  };

  onChangeSearch = keyword => {
    this.delayedSearch(keyword);
  };

  componentDidMount() {
    const {
      dealsParams: { columns }
    } = this.props;

    this.delayedSearch = _.debounce(keyword => {
      store.dispatch(setParam("keyword", keyword));
    }, 1000);

    $(this.saveState).selectpicker({
      style: "btn-primary",
      size: 5
    });
    // $(this.saveState).on("changed.bs.select", function() {
    //   const selectedState = $(this).val();
    // });

    $(this.selectCols).selectpicker({
      style: "btn-default",
      size: 4
    });
    // $(this.selectCols).selectpicker('val', columns)
    this.resetCols();

    $(this.selectCols).on("changed.bs.select", function() {
      const selectedKeys = $(this).val();
      Meteor.call(
        "updateVisibleFields",
        "salesRecord",
        selectedKeys,
        (err, res) => {
          store.dispatch(setParam("columns", selectedKeys));
        }
      );
    });
  }

  componentDidUpdate() {
    this.resetCols();
  }

  resetCols = () => {
    const {
      dealsParams: { columns }
    } = this.props;
    if (columns.indexOf("name") < 0) {
      columns.unshift("name");
    }

    const oldValues = $(this.selectCols).selectpicker("val");
    if (!_.isMatch(oldValues, columns)) {
      $(this.selectCols).selectpicker("val", columns);
    }
  };

  renderColumnsSelect = () => {
    return (
      <select multiple ref={node => (this.selectCols = node)}>
        {Object.keys(columnsDetails).map(key => (
          <option value={key} key={key}>
            {columnsDetails[key].label}
          </option>
        ))}
      </select>
    );
  };

  toggleGroupBy = event => {
    const groupBy = event.currentTarget.checked
      ? DEALS.GROUP_BY.SUBSTAGE
      : DEALS.GROUP_BY.STAGE;
    store.dispatch(setParam("groupBy", groupBy));
  };

  toggleShowArchive = event => {
    store.dispatch(setParam("showArchivedDeals", event.currentTarget.checked));
  };

  renderModal = props => {
    const { showModal } = this.state;
    return (
      <Modal
        show={showModal}
        onHide={() => {
          this.setState({ showModal: false });
        }}
        bsSize="large"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Deal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateSalesRecord {...props} />
        </Modal.Body>
      </Modal>
    );
  };

  render() {
    const {
      title,
      dealsParams: { showArchivedDeals, groupBy, keyword, columns },
      modalProps
    } = this.props;

    return (
      <Navbar>
        <Container fluid>
          <Navbar.Header>
            <Navbar.Brand>{title}</Navbar.Brand>
            <br />
            <button
              style={{ marginBottom: "5px" }}
              className="btn btn-primary"
              onClick={() => this.setState({ showModal: true })}
            >
              <span className="fa fa-plus" /> Add Deal
            </button>
          </Navbar.Header>
          <Navbar.Nav navbarRight>
            <Navbar.Text>
              <SavedViews />
            </Navbar.Text>
            <Navbar.Text>
              <Checkbox
                checked={showArchivedDeals}
                onChange={this.toggleShowArchive}
              >
                Show Archived Deals
              </Checkbox>
            </Navbar.Text>
            <Navbar.Text style={{ width: 250 }}>
              <SearchInput value={keyword} onChange={this.onChangeSearch} />
            </Navbar.Text>
            <Navbar.Text>{this.renderColumnsSelect()}</Navbar.Text>
          </Navbar.Nav>
        </Container>
        {this.renderModal(modalProps)}
      </Navbar>
    );
  }
}

const mapStateToProps = ({ dealsParams }) => {
  return {
    dealsParams
  };
};

export default connect(mapStateToProps)(SalesRecordsNavbar);
