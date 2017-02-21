import React from 'react';
import { getUserName } from '/imports/api/lib/filters';
import Select from 'react-select';
import { info, warning } from '/imports/api/lib/alerts';

class CreateProject extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            projectName: '',
            selectUsers: [{
                label: getUserName(props.currentUser, true),
                value: props.currentUser._id
            }],
            selectOptions: props.users.map(item=>{return {label: getUserName(item, true), value: item._id}})
        }
    }

    submitForm(event){
        event.preventDefault();
        const { projectName, selectUsers } = this.state;

        const data = {
            name: projectName,
            members: selectUsers.map(item=>item.value)
        };

        Meteor.call("addProject", data, err=>{
            if(err) {
                warning(`Problems with creating new project`);
                return console.log(err)
            }

            this.setState({selectUsers: [], projectName: ''});
            info(`Success add new project & integration with Slack`);
        });
    }

    changeInput(event){
        this.setState({projectName: event.target.value})
    }

    changeSelectUser(value){
        this.setState({selectUsers: value})
    }


    render() {
        const { projectName, selectUsers, selectOptions } = this.state;

        return (
            <div className="create-project">
                <form onSubmit={this.submitForm.bind(this)}
                      className="default-form">
                    <div className="field-wrap">
                        <span className="label">Project name</span>
                        <input type="text"
                               onChange={this.changeInput.bind(this)}
                               value={projectName}/>
                    </div>
                    <div className="select-wrap">
                        <span className="label">Add members</span>
                        <Select
                            multi
                            value={selectUsers}
                            onChange={this.changeSelectUser.bind(this)}
                            options={selectOptions}
                            className={"members-select"}
                            clearable={false}
                        />
                    </div>
                    <div className="submit-wrap">
                        <button className="btn primary-btn">Add project</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default  CreateProject;