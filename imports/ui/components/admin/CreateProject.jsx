import React from 'react';

class CreateUser extends React.Component{
    constructor(props){
        super(props);

    }

    render() {

        return (
            <div className="create-project">
                <form className="default-form">
                    <h2 className="title">Add new project (not working yet)</h2>
                    <div className="field-wrap">
                        <span className="label">Project name</span>
                        <input type="text"/>
                    </div>

                    <button className="btn primary-btn">Add project</button>
                </form>
            </div>
        )
    }
}

export default  CreateUser;