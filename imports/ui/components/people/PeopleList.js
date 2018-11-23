import _ from "underscore";
import React from "react";
import PropTypes from "prop-types";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import {
  Table,
  Button,
  InputGroup,
  FormControl,
  Modal,
  Panel,
  ListGroup,
  ListGroupItem,
  Label,
  Grid,
  Row,
  Col
} from "react-bootstrap";

import People from "/imports/api/models/people/people";
import { removePerson } from "/imports/api/models/people/methods";
import PersonForm from "./PersonForm";
import { ClientErrorLog } from "/imports/utils/logger";
import ScrollPosition from "../../components/utils/ScrollPosition";

const PAGESIZE = 100;
export default class PeopleList extends TrackerReact(React.Component) {
  static propTypes = {
    onSelect: PropTypes.func,
    onCreatePerson: PropTypes.func,
    updatedPerson: PropTypes.object,
    removedPerson: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.people = [];
    this.fullyLoaded = false;
    this.state = {
      page: 1,
      keyword: null,
      expanded: [],
      possibleColumns: [
        {
          key: "_id",
          label: "ID",
          selected: false,
          renderer: person => person._id
        },
        {
          key: "name",
          label: "Name",
          selected: false,
          renderer: person => person.name
        },
        {
          key: "emails",
          label: "Email",
          selected: false,
          renderer: person => {
            const email = person.defaultEmail();
            return email ? email : null;
          }
        },
        {
          key: "phone_numbers",
          label: "Phone Number",
          selected: false,
          renderer: person => {
            const phoneNumber = person.defaultPhoneNumber();
            return phoneNumber ? phoneNumber : null;
          }
        },
        {
          key: "designation_id",
          label: "Designation",
          selected: false,
          renderer: person => {
            const designation = person.designation();
            return designation ? designation.name : null;
          }
        },
        {
          key: "role",
          label: "Role",
          selected: false,
          renderer: person => person.role
        },
        {
          key: "company_id",
          label: "Company",
          selected: false,
          renderer: person => {
            const company = person.company();
            return company ? company.name : null;
          }
        },
        {
          key: "position",
          label: "Position",
          selected: false,
          renderer: person => person.position
        }
      ]
    };
    this.state.sort = {
      by: "name",
      asc: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { removedPerson } = nextProps;

    if (removedPerson) {
      this.setState({ removedPerson });
    }
  }

  loadData() {
    const { keyword, page, removedPerson } = this.state;

    const filters = { removed: { $ne: true } };
    if (keyword && keyword.length) {
      const regx = { $regex: keyword, $options: "i" };
      filters["$or"] = [{ email: regx }, { name: regx }];
    }

    const result = People.find(filters, {
      skip: (page - 1) * PAGESIZE,
      limit: PAGESIZE,
      sort: { name: 1 }
    }).fetch();
    if (result.length != PAGESIZE) this.fullyLoaded = true;
    result.forEach(c => {
      const index = this.people.findIndex(c1 => c1._id == c._id);
      if (index >= 0) {
        this.people.splice(index, 1, c);
      } else {
        this.people.push(c);
      }
    });

    if (removedPerson) {
      const index = this.people.findIndex(c => c._id == removedPerson._id);
      if (index > -1) this.people.splice(index, 1);
    }

    return this.people;
  }

  componentDidMount() {
    const _this = this;

    Meteor.call("getVisibleFields", "people", (error, selectedFields) => {
      if (!error) {
        const possibleColumns = _this.state.possibleColumns;
        possibleColumns.forEach(column => {
          if (selectedFields.includes(column.key)) {
            column.selected = true;
          }
        });

        _this.setState({ possibleColumns });

        $(".selectpicker").selectpicker({
          style: "btn-default",
          size: 4
        });

        $(".selectpicker").selectpicker("val", selectedFields);
      }
    });

    $(".selectpicker").selectpicker({
      style: "btn-default",
      size: 4
    });

    $(".selectpicker").on("changed.bs.select", function() {
      const selectedKeys = $(this).val();
      const possibleColumns = _this.state.possibleColumns;
      possibleColumns.forEach(column => {
        if (selectedKeys.includes(column.key)) return (column.selected = true);
        return (column.selected = false);
      });
      _this.setState({
        possibleColumns
      });

      Meteor.call("updateVisibleFields", "people", selectedKeys, error => {
        if (error) {
          console.log("updateVisibleFields people", error);
        }
      });
    });
  }

  componentWillUnmount() {
    $(".selectpicker").off("changed.bs.select");
  }

  render() {
    return (
      <div className="contact-list">
        {this.renderToolbar()}
        {this.renderContent()}
        {this.renderModal()}
      </div>
    );
  }

  renderToolbar() {
    return (
      <div className="toolbar-panel">
        <div style={{ flex: 1 }}>
          <Button
            bsStyle="primary"
            onClick={() => this.setState({ showModal: true, creating: true })}
          >
            <i className="fa fa-user-plus" />
          </Button>
        </div>
        <div style={{ width: 250 }}>
          <div className="list-view-toolbar">
            <select className="selectpicker" multiple>
              {this.state.possibleColumns.map(({ key, label }) => (
                <option value={key} key={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ width: 250 }}>
          <InputGroup>
            <InputGroup.Addon>
              <i className="fa fa-search" />
            </InputGroup.Addon>
            <FormControl
              type="text"
              placeholder="Search..."
              onChange={this.onChangeSearch}
            />
          </InputGroup>
        </div>
      </div>
    );
  }

  renderContent() {
    const selectedColumns = this.state.possibleColumns.filter(
      ({ selected }) => selected
    );
    const { by, asc } = this.state.sort;
    return (
      <div className="content-panel">
        <Table striped hover>
          <thead>
            <tr>
              <th width="5%">#</th>
              {selectedColumns.map(({ label, key }) => (
                <th
                  width={`${90 / selectedColumns.length}%`}
                  key={key}
                  onClick={() => this.sortBy(key)}
                >
                  {label}
                  {by == key && asc && (
                    <i style={{ marginLeft: 5 }} className="fa fa-caret-up" />
                  )}
                  {by == key && !asc && (
                    <i style={{ marginLeft: 5 }} className="fa fa-caret-down" />
                  )}
                </th>
              ))}
              <th className="th-action" width="5%" />
            </tr>
          </thead>
          <ScrollPosition path="/people">
            <tbody onScroll={this.onScrollList}>{this.renderRows()}</tbody>
          </ScrollPosition>
        </Table>
      </div>
    );
  }

  getSortedData() {
    const people = this.loadData();
    // const {keyword} = this.props
    const { by, asc } = this.state.sort;

    // if(!this.state.showArchivedDeals) salesRecords = salesRecords.filter(s => !s.archived)
    // if(keyword && keyword.length > 0) {
    //     salesRecords = salesRecords.filter((s) => s.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
    // }

    if (asc) {
      return _.sortBy(people, by);
    } else {
      return _.sortBy(people, by).reverse();
    }
  }

  sortBy = key => {
    const { by, asc } = this.state.sort;

    if (by == key) this.setState({ sort: { by, asc: !asc } });
    else this.setState({ sort: { by: key, asc: true } });
  };

  renderRows() {
    const selectedColumns = this.state.possibleColumns.filter(
      ({ selected }) => selected
    );
    const people = this.loadData();
    if (!people || people.length == 0) return;

    const compare = (c1, c2) => {
      if (c1.name > c2.name) return 1;
      else if (c1.name < c2.name) return -1;
      else {
        if (c1.email > c2.email) return 1;
        else if (c1.email < c2.email) return -1;
        return 0;
      }
    };

    const trs = [];

    people.sort(compare).forEach(person => {
      trs.push(
        <tr key={person._id}>
          <td width="5%">
            <Button bsSize="xsmall" onClick={() => this.onToggleRow(person)}>
              {this.isExpanded(person) ? (
                <i className="fa fa-minus" />
              ) : (
                <i className="fa fa-plus" />
              )}
            </Button>
          </td>
          {selectedColumns.map(({ key, renderer }) => (
            <td width={`${90 / selectedColumns.length}%`} key={key}>
              {renderer && typeof renderer === "function" && renderer(person)}
            </td>
          ))}
          {
            // <td width="15%">{person.name}</td>
            // <td width="15%">{person.defaultEmail()}</td>
            // <td width="15%">{person.designation() ? person.designation().name : ''}</td>
            // <td width="15%">{person.role}</td>
            // <td width="15%">{person.company() ? person.company().name : ''}</td>
            // <td width="15%">{person.position}</td>
          }
          <td width="5%">
            <Button bsSize="xsmall" onClick={() => this.onEditPerson(person)}>
              <i className="fa fa-edit" />
            </Button>
            &nbsp;
            <Button
              bsStyle="danger"
              bsSize="xsmall"
              onClick={() => this.onRemovePerson(person)}
            >
              <i className="fa fa-trash" />
            </Button>
          </td>
        </tr>
      );

      if (this.isExpanded(person)) {
        trs.push(
          <tr key={`expanded-${person._id}`}>
            <td />
            <td colSpan={7} width="100%">
              {this.renderPersonDetails(person)}
            </td>
          </tr>
        );
      }
    });

    return trs;
  }

  renderPersonDetails(person) {
    return (
      <Grid fluid>
        <Row>
          <Col md={4}>
            <Panel>
              <Panel.Heading>Social Info</Panel.Heading>
              <Panel.Body>
                <ListGroup>
                  <ListGroupItem>
                    <Label>Twitter</Label>&nbsp;{person.twitter}
                  </ListGroupItem>
                  <ListGroupItem>
                    <Label>Facebook</Label>&nbsp;{person.facebook}
                  </ListGroupItem>
                  <ListGroupItem>
                    <Label>LinkedIn</Label>&nbsp;{person.linkedin}
                  </ListGroupItem>
                </ListGroup>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={4}>
            <Panel>
              <Panel.Heading>Emails</Panel.Heading>
              <Panel.Body>
                <Table>
                  <thead>
                    <tr>
                      <th width="60%">Email</th>
                      <th width="25%">Type</th>
                      <th width="15%">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {person.emails &&
                      person.emails.map((e, i) => (
                        <tr key={`email-${person._id}-#${i}`}>
                          <td width="60%">{e.email}</td>
                          <td width="25%">{e.type}</td>
                          <td width="15%">{e.is_default ? "YES" : ""}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={4}>
            <Panel>
              <Panel.Heading>Phone numbers</Panel.Heading>
              <Panel.Body>
                <Table>
                  <thead>
                    <tr>
                      <th width="40%">Number</th>
                      <th width="20%">Extension</th>
                      <th width="25%">Type</th>
                      <th width="15%">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {person.phone_numbers &&
                      person.phone_numbers.map((p, i) => (
                        <tr key={`phone-number-${person._id}-#${i}`}>
                          <td width="40%">{p.number}</td>
                          <td width="20%">{p.extension}</td>
                          <td width="25%">{p.type}</td>
                          <td width="15%">{p.is_default ? "YES" : ""}</td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
  renderModal() {
    const { showModal, selectedPerson, creating } = this.state;
    const title = selectedPerson && !creating ? "Edit person" : "Create person";

    return (
      <Modal
        show={showModal}
        onHide={() => {
          this.setState({ showModal: false });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fa fa-vcard-o" /> {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PersonForm
            person={!creating ? selectedPerson : null}
            onSaved={this.onSavedPerson}
          />
        </Modal.Body>
      </Modal>
    );
  }

  onToggleRow = person => {
    const { expanded } = this.state;
    const index = _.findIndex(expanded, { _id: person._id });
    if (index > -1) expanded.splice(index, 1);
    else expanded.push(person);

    this.setState({ expanded });
  };
  isExpanded = person =>
    _.findIndex(this.state.expanded, { _id: person._id }) > -1;

  onScrollList = evt => {
    const el = evt.target;

    if (
      !this.fullyLoaded &&
      el.scrollTop + el.clientHeight == el.scrollHeight
    ) {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }

      this.scrollTimeout = setTimeout(() => {
        const page = this.state.page;
        this.setState({ page: page + 1 });
      }, 500);

      evt.preventDefault();
    }
  };

  onChangeSearch = evt => {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    const keyword = evt.target.value;
    this.searchTimeout = setTimeout(() => {
      this.people = [];
      this.fullyLoaded = false;
      this.setState({ keyword, page: 1 });
    }, 500);
  };

  onEditPerson = person => {
    this.setState({
      showModal: true,
      selectedPerson: person,
      creating: false
    });
  };
  onRemovePerson = person => {
    if (confirm(`Are you sure to remove ${person.name}?`)) {
      try {
        removePerson.call(
          { _id: person._id },
          error => !error && this.setState({ removedPerson: person })
        );
      } catch (e) {
        ClientErrorLog.error(e);
      }
    }
  };

  onSavedPerson = () => {
    this.setState({ showModal: false });
  };
}
