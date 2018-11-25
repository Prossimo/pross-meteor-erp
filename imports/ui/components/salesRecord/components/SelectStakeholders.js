import React, { Component } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import People from "/imports/api/models/people/people";
import { createContainer } from "meteor/react-meteor-data";

export default class SelectStakeholders extends Component {
  static propTypes = {
    people: PropTypes.array,
    onSelectPeople: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    let people = props.people;
    if (!people) {
      people = People.find().fetch();
    }
    this.peopleOptions = people
      .map(person => {
        const designation = person.designation();
        const company = person.company();
        return {
          addToMain: designation != null && designation.name === "Stakeholder",
          addableToMain:
            designation != null && designation.name === "Stakeholder",
          isMainStakeholder:
            person.isMainStakeholder != null ? person.isMainStakeholder : false,
          name: person.name,
          email: person.defaultEmail(),
          _id: person._id,
          company: company ? company.name : null
        };
      })
      .map(person => ({
        label: `${person.name} ${person.company}`,
        value: person._id,
        ...person
      }));

    this.state = {
      selectedPeople: props.people ? this.peopleOptions : []
    };
    if (this.state.selectedPeople.length && this.props.onSelectPeople) {
      this.props.onSelectPeople(
        this.state.selectedPeople.map(
          ({ _id, isMainStakeholder, addToMain }) => ({
            peopleId: _id,
            isMainStakeholder,
            addToMain
          })
        )
      );
    }
  }

  selectMain = mainId => {
    this.state.selectedPeople.forEach(
      p => (p.isMainStakeholder = p._id === mainId)
    );
    this.setState(
      prevState => prevState,
      () => {
        this.props.onSelectPeople(
          this.state.selectedPeople.map(
            ({ _id, isMainStakeholder, addToMain }) => ({
              peopleId: _id,
              isMainStakeholder,
              addToMain
            })
          )
        );
      }
    );
  };

  enableNotify = (_id, checked) => {
    this.state.selectedPeople.forEach(
      p => p._id === _id && (p.addToMain = checked)
    );
    this.setState(
      prevState => prevState,
      () => {
        this.props.onSelectPeople(
          this.state.selectedPeople.map(
            ({ _id, isMainStakeholder, addToMain }) => ({
              peopleId: _id,
              isMainStakeholder,
              addToMain
            })
          )
        );
      }
    );
  };

  selectPeople = peopleOption => {
    const people = Array.isArray(peopleOption) ? peopleOption : [peopleOption];

    !people.find(({ isMainStakeholder }) => isMainStakeholder) &&
      people.length &&
      (people[0].isMainStakeholder = true);
    this.setState({ selectedPeople: people }, () => {
      this.props.onSelectPeople(
        this.state.selectedPeople.map(
          ({ _id, isMainStakeholder, addToMain }) => ({
            peopleId: _id,
            isMainStakeholder,
            addToMain
          })
        )
      );
    });
  };

  renderMembers() {
    return (
      <table className="table table-condensed">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Main Stakeholder</th>
            <th>Add To Main</th>
          </tr>
        </thead>
        <tbody>
          {this.state.selectedPeople.map(person => {
            const {
              _id,
              name,
              email,
              company,
              isMainStakeholder,
              addToMain,
              addableToMain
            } = person;
            return (
              <tr key={_id}>
                <td>
                  <div>{name}</div>
                  <div>{email}</div>
                </td>
                <td>{company}</td>
                <td>
                  <div className="radio">
                    <label>
                      <input
                        type="checkbox"
                        checked={isMainStakeholder}
                        onChange={() => this.selectMain(_id)}
                      />
                    </label>
                  </div>
                </td>
                <td>
                  <div className="radio">
                    <label>
                      <input
                        type="checkbox"
                        checked={addToMain}
                        onChange={event =>
                          this.enableNotify(_id, event.target.checked)
                        }
                        disabled={!addableToMain}
                      />
                    </label>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">Add People</div>
        <div className="panel-body">
          <label>People</label>
          <Select
            multi
            onChange={this.selectPeople}
            options={this.peopleOptions}
            optionRenderer={option => (
              <div style={{ display: "flex" }}>
                <span style={{ flex: 1 }}>{option.name}</span>
                <span>{option.company}</span>
              </div>
            )}
            value={this.state.selectedPeople}
            valueRenderer={option => <span>{option.name}</span>}
            className={"members-select"}
          />
          <div>{this.renderMembers()}</div>
        </div>
      </div>
    );
  }
}
