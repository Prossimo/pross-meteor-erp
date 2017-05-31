import React, { Component } from 'react'
import moment from 'moment'
import styled from 'styled-components'

class Files extends Component {
  constructor(props) {
    super(props)
    const { project: { folderId } } = this.props
    this.state = {
      files: [],
      selectedFile: '',
      viewPath: [folderId],
    }
    this.selectFile = this.selectFile.bind(this)
    this.listFiles = this.listFiles.bind(this)
    this.openFile = this.openFile.bind(this)
  }

  openFile(id, mimeType) {
    switch (mimeType) {
      case 'application/vnd.google-apps.folder':
        const viewPath = this.state.viewPath.concat(id)
        this.state = {
          files: [],
          selectedFile: '',
          viewPath,
        }
        this.listFiles()
        break
    }
  }

  listFiles() {
    const folderId = _.last(this.state.viewPath)
    const query = `'${folderId}' in parents and trashed = false`
    // LIST CURRENT FILES
    Meteor.call(
      'drive.listFiles',
      { query },
      (error, { files }) => !error && (this.setState({ files }))
    )
  }

  componentDidMount() {
    this.listFiles()
  }

  selectFile(selectedFile, mimeType) {
    if (this.state.selectedFile === selectedFile) {
      this.openFile(selectedFile, mimeType)
    } else {
      this.setState({ selectedFile })
    }
  }

  render() {
    return (
      <div>
        <div className='text-center'>
          <div className='btn-group'>
            <button className='btn btn-default btn-sm fa fa-upload'/>
            <button className='btn btn-default btn-sm fa fa-download'/>
            <button className='btn btn-default btn-sm fa fa-trash'/>
            <button className='btn btn-default btn-sm fa fa-folder'/>
            <button className='btn btn-default btn-sm fa fa-file'/>
          </div>
        </div>
        <br/>
        <div>
          <table className='table table-condensed table-hover'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Last modified</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.files.map(file => {
                  const { id, name, modifiedTime, iconLink, webViewLink, mimeType } = file
                  const formattedTime = moment(modifiedTime).format('YYYY MMM DD hh:mm:ss')
                  const FileRow = styled.tr`
                    cursor: pointer;
                    img {
                      margin-top: -5px;
                    }
                    &.active {
                      color: white;
                      font-weight: bold;
                      td {
                        background-color: #4285f4 !important;
                      }
                    }
                  `
                  return (
                    <FileRow
                      key={id}
                      className={this.state.selectedFile === id ? 'active' : ''}
                      onClick={ () => this.selectFile(id, mimeType)}
                    >
                      <td><img src={ iconLink }/> { name }</td>
                      <td>{ formattedTime }</td>
                    </FileRow>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Files
