import React from 'react';
import EditableUsersTable  from '../components/admin/EditableUsersTable'

class AdminPage extends React.Component{
  constructor(props){
    super(props);
  }
  
  render() {
    return (
      <div className="page-container admin-page">
        <div className="main-content">
          <div className="tab-container">
            <h2 className="page-title">Admin page</h2>
            <EditableUsersTable createdUsers={this.props.createdUsers}/>
          </div>
        </div>
      </div>
    )
  }
}
export default AdminPage;