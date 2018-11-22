import _ from "underscore";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Form,
  FormGroup,
  FormControl,
  Col,
  Modal
} from "react-bootstrap";
import Select from "react-select";
import { warning } from "/imports/api/lib/alerts";
import { PeopleDesignations, Companies } from "/imports/api/models";
import { insertPeople } from "/imports/api/models/people/methods";
import CompanyForm from "../companies/CompanyForm";

export default class PeopleForm extends TrackerReact(React.Component) {
  static propTypes = {
    people: PropTypes.array,
    onSaved: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      people: props.people
    };
  }

  changeState = (obj, key, val) => {
    obj[key] = val;

    this.setState({ people: this.state.people });

    if (this.props.onChange) this.props.onChange(this.state.people);
  };

  onClickRemovePerson = index => {
    const { people } = this.state;
    people.splice(index, 1);
    this.setState({ people });

    if (this.props.onChange) this.props.onChange(people);
  };

  onClickAddCompany = () => {
    this.setState({
      showCompanyModal: true
    });
  };

  onCompanyInputChange = value => {
    this.setState({
      currentCompanyInputValue: value
    });
  };

  onSavedCompany = () => {
    this.setState({
      showCompanyModal: false
    });
  };

  renderCompanyModal() {
    const { showCompanyModal } = this.state;

    return (
      <Modal
        show={showCompanyModal}
        bsSize="large"
        onHide={() => {
          this.setState({ showCompanyModal: false });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fa fa-building-o" />
            &nbsp;Create company
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CompanyForm
            onSaved={this.onSavedCompany}
            name={this.state.currentCompanyInputValue}
          />
        </Modal.Body>
      </Modal>
    );
  }
  render() {
    const { people } = this.state;

    const designations = PeopleDesignations.find().fetch();
    const companies = Companies.find().fetch();

    const designationOptions = designations.map(d => ({
      value: d._id,
      label: d.name
    }));
    const companyOptions = companies.map(c => ({
      value: c._id,
      label: c.name
    }));

    const companyNoResultsEl = (
      <div className="select-no-result">
        <div>No results</div>
        <div className="action" onClick={this.onClickAddCompany}>
          + Add{" "}
          <strong>
            <italic>{this.state.currentCompanyInputValue}</italic>
          </strong>
        </div>
      </div>
    );
    return (
      <div>
        <Form style={{ padding: 10 }} horizontal onSubmit={this.onSubmit}>
          <table className="table table-condensed">
            <thead>
              <tr>
                <th width="20%">Name</th>
                <th width="25%">Email</th>
                <th width="15%">Designation</th>
                <th width="15%">Role</th>
                <th width="13%">Company</th>
                <th width="10%">Position</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {people.map((person, index) => {
                let designation,
                  designationValue,
                  roleOptions = [],
                  roleValue,
                  roleAddable = false;
                if (person.designation_id) {
                  designation = _.findWhere(designations, {
                    _id: person.designation_id
                  });
                  if (designation) {
                    designationValue = {
                      value: designation._id,
                      label: designation.name
                    };
                    roleOptions = designation.roles.map(r => ({
                      value: r.name,
                      label: r.name
                    }));
                    if (person.role)
                      roleValue =
                        _.findIndex(designation.roles, { name: person.role }) >
                        -1
                          ? { value: person.role, label: person.role }
                          : null;
                    roleAddable = designation.role_addable;
                  }
                }
                let companyValue;
                if (person.company_id) {
                  const company = _.findWhere(companies, {
                    _id: person.company_id
                  });
                  if (company)
                    companyValue = { value: company._id, label: company.name };
                }
                return (
                  <tr key={index}>
                    <td>
                      <FormControl
                        type="text"
                        value={person.name}
                        onChange={e =>
                          this.changeState(person, "name", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <FormControl
                        type="email"
                        value={person.email}
                        onChange={e =>
                          this.changeState(person, "email", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Select
                        clearable={false}
                        required
                        options={designationOptions}
                        value={designationValue}
                        onChange={item =>
                          this.changeState(person, "designation_id", item.value)
                        }
                      />
                    </td>
                    <td>
                      <Select
                        clearable={false}
                        options={roleOptions}
                        value={roleValue}
                        onChange={item =>
                          this.changeState(person, "role", item.value)
                        }
                      />
                    </td>
                    <td>
                      <Select
                        clearable={false}
                        options={companyOptions}
                        value={companyValue}
                        onChange={item =>
                          this.changeState(person, "company_id", item.value)
                        }
                        noResultsText={companyNoResultsEl}
                        onInputChange={this.onCompanyInputChange}
                      />
                    </td>
                    <td>
                      <FormControl
                        type="text"
                        value={person.position}
                        onChange={e =>
                          this.changeState(person, "position", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <Button
                        bsSize="xsmall"
                        onClick={() => this.onClickRemovePerson(index)}
                      >
                        <i className="fa fa-trash" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <FormGroup>
            <Col sm={12} style={{ textAlign: "right" }}>
              <Button type="submit" bsStyle="primary">
                Convert
              </Button>
            </Col>
          </FormGroup>
        </Form>

        {this.renderCompanyModal()}
      </div>
    );
  }

  onSubmit = evt => {
    evt.preventDefault();

    const { people } = this.state;

    try {
      insertPeople.call({ people });
      if (this.props.onSaved) this.props.onSaved();
    } catch (e) {
      console.log(e);
      warning(e.error);
    }
  };
}
