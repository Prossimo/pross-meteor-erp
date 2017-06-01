import React, { Component } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import _ from 'underscore'
import FileUploader from './FileUploader.jsx'

const FileManager = styled.div `
  position: relative;
`
const LoadingIcon = styled.div `
  position: absolute;
  top: 150px;
  left: 50%
`
class Files extends Component {
  constructor(props) {
    super(props)
    const { project: { folderId, name } } = this.props
    this.state = {
      files: [],
      selectedFile: '',
      viewPath: [{ folderId, name }],
      loading: false,
    }
    this.selectFile = this.selectFile.bind(this)
    this.listFiles = this.listFiles.bind(this)
    this.openFile = this.openFile.bind(this)
    this.openFileDirectly = this.openFileDirectly.bind(this)
    this.pickFile = this.pickFile.bind(this)
    this.goBack = this.goBack.bind(this)
    this.renderFiles = this.renderFiles.bind(this)
    this.renderViewPath = this.renderViewPath.bind(this)
    this.addFileToView = this.addFileToView.bind(this)
  }

  openFile(folderId, name, mimeType) {
    switch (mimeType) {
      case 'application/vnd.google-apps.folder':
        this.state.viewPath.push({ folderId, name })
        this.listFiles()
        break
    }
  }

  openFileDirectly(folderId) {
    const indexInPath = _.findIndex(this.state.viewPath, item => item.folderId === folderId)
    this.state.viewPath = this.state.viewPath.slice(0, indexInPath + 1)
    this.listFiles()
  }

  listFiles() {
    const folderId = _.last(this.state.viewPath).folderId
    const query = `'${folderId}' in parents and trashed = false`
    // LIST CURRENT FILES
    this.setState({
      files: [],
      loading: true,
      selectedFile: '',
    })
    Meteor.call(
      'drive.listFiles',
      { query },
      (error, { files }) => !error && (this.setState({ files, loading: false }))
    )
  }

  componentDidMount() {
    this.listFiles()
  }

  selectFile(selectedFile, name, mimeType) {
    if (this.state.selectedFile === selectedFile) {
      this.openFile(selectedFile, name, mimeType)
    } else {
      this.setState({ selectedFile })
    }
  }

  goBack() {
    if (this.state.viewPath.length > 1) {
      this.state.viewPath.pop()
      this.listFiles()
    }
  }

  renderViewPath() {
    const activeFolderId = _.last(this.state.viewPath).folderId
    return (
      <ol className='breadcrumb'>
        {
          this.state.viewPath.map(({ folderId, name }) => {
            if (folderId === activeFolderId)
              return (
                <li
                  className='active'
                  key={folderId}
                  >
                  { name }
                </li>
              )
            return (
              <li
                key={folderId}
                onClick={() => this.openFileDirectly(folderId, name)}
              >
                <a href='#'>{ name }</a>
              </li>
            )
          })
        }
      </ol>
    )
  }

  renderFiles() {
    if (this.state.files.length === 0 && !this.state.loading)
      return (<tr className='text-center'><td colSpan={2}>Empty Folder</td></tr>)
    const files = _.sortBy(this.state.files, ({ modifiedTime }) => - new Date(modifiedTime).getTime())
    return files.map(file => {
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
          onClick={ () => this.selectFile(id, name, mimeType)}
        >
          <td><img src={ iconLink }/> { name }</td>
          <td>{ formattedTime }</td>
        </FileRow>
      )
    })
  }

  pickFile() {
    this.refs.uploader.pickFile()
  }

  addFileToView(file) {
    this.state.files.push(file)
    this.setState(prevState => prevState)
  }

  render() {
    return (
      <FileManager>
        <FileUploader
          ref='uploader'
          folderId={_.last(this.state.viewPath).folderId}
          addFileToView={this.addFileToView}
        />
        <div className='text-center'>
          <div className='btn-group'>
            <button className='btn btn-default btn-sm fa fa-chevron-left' onClick={this.goBack}/>
            <button className='btn btn-default btn-sm fa fa-upload' onClick={this.pickFile}/>
            <button className='btn btn-default btn-sm fa fa-download'/>
            <button className='btn btn-default btn-sm fa fa-trash'/>
            <button className='btn btn-default btn-sm fa fa-folder'/>
            <button className='btn btn-default btn-sm fa fa-file'/>
          </div>
        </div>
        <br/>
        <div>
          {
            (this.state.loading) ? (
              <LoadingIcon>
                <i className='fa fa-spinner fa-spin fa-3x fa-fw'/>
              </LoadingIcon>
            ) : ''
          }
          {
            this.renderViewPath()
          }
          <table className='table table-condensed table-hover'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Last modified</th>
              </tr>
            </thead>
            <tbody>
            { this.renderFiles() }
            </tbody>
          </table>
        </div>
      </FileManager>
    )
  }
}

export default Files
