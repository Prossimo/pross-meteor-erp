import React, { Component } from 'react'
import MediaUploader from '../libs/MediaUploader'
import PropTypes from 'prop-types'
import { warning } from '/imports/api/lib/alerts'

class FileUploader extends Component {
  constructor() {
    super()
    this.pickFile = this.pickFile.bind(this)
    this.uploadFile = this.uploadFile.bind(this)
  }

  componentDidMount() {
    Meteor.call('drive.getAccessToken', {}, (error, token) => {
      if (error) return warning('could not connect to google drive')
      this.token = token
    })
  }

  uploadFile(event) {
    const files = event.target.files
    _.toArray(files).forEach(file =>
     new MediaUploader({
        file,
        token: this.token,
        metadata: {
          parents: [this.props.folderId],
        },
        params: {
          fields: '*'
        },
        onComplete: (remoteFile) => this.props.addFileToView(JSON.parse(remoteFile))
      }).upload()
    )
    this.refs.file.value = ''
  }

  pickFile() {
    this.refs.file.click()
  }

  render() {
    return <input type='file' ref='file' className='hide' onChange={this.uploadFile}/>
  }
}

FileUploader.propTypes = {
  folderId: PropTypes.string.isRequired,
  addFileToView: PropTypes.func.isRequired,
}

export default FileUploader
