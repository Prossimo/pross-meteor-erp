import React, { Component } from 'react'
import MediaUploader from '../libs/MediaUploader'
import PropTypes from 'prop-types'
import { warning } from '/imports/api/lib/alerts'
import {
  getSlackUsername,
  getAvatarUrl
} from '../../../api/lib/filters'

class FileUploader extends Component {
  constructor() {
    super()
    this.state = {
      percentage: 0,
    }
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
    const percentages = []
    const updatePercentage = () => {
      const sum = percentages.reduce((result, next) => result + next, 0)
      const percentage = Math.round(sum / percentages.length)
      this.setState({ percentage })
    }
    const hideProgessBar = () => {
      const sum = percentages.reduce((result, next) => result + next, 0)
      const percentage = Math.round(sum / percentages.length)
      if (percentage === 100) this.setState({ percentage: 0 })
    }
    _.toArray(event.target.files).forEach((file, index) => {
      percentages[index] = 0
      new MediaUploader({
        file,
        token: this.token,
        metadata: {
          parents: [this.props.folderId],
        },
        params: {
          fields: '*'
        },
        onProgress: ({ loaded, total }) => {
          percentages[index] = Math.round(total/loaded * 100)
          updatePercentage()
        },
        onComplete: (remoteFile) => {
          remoteFile = JSON.parse(remoteFile)
          this.props.addFileToView(remoteFile)
          hideProgessBar()
          const params = {
            ...this.props.slack,
            attachments: [
              {
                color: '#36a64f',
                text: `<${remoteFile.webViewLink}|Go to file ${remoteFile.name}>`
              }
            ]
          }
          const slackText = 'I just uploaded new file'
          Meteor.call('sendBotMessage', this.props.slack.chanel, slackText, params)
        }
      }).upload()
    })
    this.refs.file.value = ''
  }

  pickFile() {
    this.refs.file.click()
  }

  render() {
    return (
      <div>
        {
          (this.state.percentage) ? (
            <div className='progress'>
              <div
                className='progress-bar'
                aria-valuemin='0'
                aria-valuemax='100'
                style={{width: `${this.state.percentage}%`}}
              >
               { this.state.percentage } %
              </div>
            </div>
          ) : ''
        }
        <input type='file' ref='file' className='hide' onChange={this.uploadFile} multiple/>
      </div>
    )
  }
}

FileUploader.propTypes = {
  folderId: PropTypes.string.isRequired,
  addFileToView: PropTypes.func.isRequired,
  slack: PropTypes.object.isRequired,
}

export default FileUploader
