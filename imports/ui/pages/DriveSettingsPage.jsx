import React, { Component } from 'react';
import styled from 'styled-components';
import picker from 'meteor/picker';

class DriveSettingsPage extends Component {
  constructor() {
    super();
    picker.then(p => this.picker = p);
    this.updateFolder = this.updateFolder.bind(this);
  }

  updateFolder(key, name, id) {
    this.picker.pick(result => {
      console.log(result);
    });
  }

  render() {
    const ContentWrapper = styled.div `
      background-color: white;
      padding: 20px 30px;
      min-height: 300px;
    `;
    const settings = [
      {
        key: 'Project Root',
        folder: {
          name: '00Projects',
          id: '0B2L677Tiv56RbmRDUDdTQnZTbHM',
        },
      },
      {
        key: 'Deal Root',
        folder: {
          name: '01Internals',
          id: '1B9TUb-58jBJ-WFp3ZmhsVEZqVmc',
        },
      },
      {
        key: 'Project Template Folder',
        folder: {
          name: '000ProjectTemplate',
          id: '2B9TUb-58jBJ-WFp3ZmhsVEZqVmc',
        },
      },
      {
        key: 'Deal Template Folder',
        folder: {
          name: '000DealTemplate',
          id: '3B9TUb-58jBJ-WFp3ZmhsVEZqVmc',
        },
      },
    ];
    return (
      <ContentWrapper>
        <div className='panel panel-default'>
          <div className='panel-heading'>Folder Selection</div>
          <div className='panel-body'>
            <table className='table table-condensed'>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Folder Name</th>
                  <th>Folder Id</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  settings.map(({ key, folder: { name, id } })=> {
                    return (
                      <tr key={key}>
                        <td>{ key }</td>
                        <td>{ name }</td>
                        <td>{ id }</td>
                        <td>
                          <div className='btn-group'>
                            <button className='btn btn-default btn-sm' onClick={()=> this.updateFolder(key, name, id)}>
                              <i className='fa fa-folder-o'/> Update
                            </button>
                            <button className='btn btn-default btn-sm' onClick={()=> this.updateFolder(key, name, id)}>
                              <i className='fa fa-refresh'/> Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </ContentWrapper>
    );
  }
}

export default DriveSettingsPage;
