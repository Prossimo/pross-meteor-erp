import _ from 'underscore'
//import {WritableStream} from 'web-streams-polyfill';
//import streamSaver from 'StreamSaver'
import progress from 'request-progress'
import Download from './download'
import NylasAPI  from '../nylas-api'


class EmailFileDownload extends Download {
    constructor(options = {}) {
        super(options)

        if (!options.accountId)
            throw new Error("Download.constructor: You must provide a non-empty accountId.")

        this.accountId = options.accountId

        this.provider = 'email'
    }

    data() {
        return this;
    }

    run = () => {
        console.log("EmailDownload->run")
        // If run has already been called, return the existing promise. Never
        // initiate multiple downloads for the same file
        if (this.promise) return this.promise

        this.promise = new Promise((resolve, reject) => {
            console.log('Filename & filesize', this.filename, this.filesize)
            //const stream = streamSaver.createWriteStream(this.filename, this.filesize)
            this.state = Download.State.Downloading

            console.log("EmailDownload make Request")
            NylasAPI.makeRequest({
                json: false,
                path: `/files/${this.fileId}/download`,
                accountId: this.accountId,
                encoding: null, // Tell `request` not to parse the response data
                started: (req) => {
                    this.request = req
                    progress(this.request, {throtte: 250})
                        .on("progress", (progress) => {
                            console.log('EmailDownload progress', progress)
                            this.percent = progress.percent
                            this.progressCallback()
                        })
                        .on("error", (err) => {
                            console.error("EmailDownload error", err)
                            this.request = null
                            this.state = Download.State.Failed
                            //stream.end()
                            /*if(fs.existsSync(@targetPath))
                             fs.unlinkSync(@targetPath)*/
                            reject(this)
                        })
                        .on("end", () => {
                            console.log('EmailDownload end')
                            if (this.state == Download.State.Failed) return
                            this.request = null
                            this.state = Download.State.Finished
                            this.percent = 100
                            //stream.end()
                            resolve(this) // Note: we must resolve with this
                        })
                        //.pipeTo(stream)
                }
            })

        })

        return this.promise
    }

}

module.exports = EmailFileDownload