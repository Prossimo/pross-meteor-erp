import _ from 'underscore'
//import {WritableStream} from 'web-streams-polyfill';
//import streamSaver from 'StreamSaver'
import progress from 'request-progress'
import Download from './download'
import NylasAPI  from '../nylas-api'
import AccountStore from '../account-store'

class EmailFileDownload extends Download {
    constructor(options = {}) {
        super(options)

        if (!options.accountId)
            throw new Error("Download.constructor: You must provide a non-empty accountId.")

        this.accountId = options.accountId

        this.provider = 'email'
    }

    data() {
        //return _.extend(super.data(), {provider:'email', blob:this.blob});
        return Object.freeze(_.clone({
            state: this.state,
            fileId: this.fileId,
            percent: this.percent,
            filename: this.filename,
            filesize: this.filesize,
            blob: this.blob
        }))
    }

    run = () => {
        // If run has already been called, return the existing promise. Never
        // initiate multiple downloads for the same file
        if (this.promise) return this.promise

        this.promise = new Promise((resolve, reject) => {
            this.state = Download.State.Downloading

            /*NylasAPI.makeRequest({
                json: false,
                path: `/files/${this.fileId}/download`,
                accountId: this.accountId,
                encoding: null, // Tell `request` not to parse the response data
                started: (req) => {
                    this.request = req
                    /!*progress(this.request, {throtte: 250})
                        .on("progress", (progress) => {console.log(progress)
                            this.percent = progress.percent
                            this.progressCallback()
                        })
                        .on("error", (err) => {
                            this.request = null
                            this.state = Download.State.Failed
                            reject(this)
                        })
                        .on("end", () => {
                            if (this.state == Download.State.Failed) return
                            this.request = null
                            this.state = Download.State.Finished
                            this.percent = 100
                            resolve(this) // Note: we must resolve with this
                        })*!/
                }
            }).then((res)=>{
                this.request = null
                this.blob = `data:${this.contentType};base64,${new Buffer(res,'binary').toString('base64')}`
                this.state = Download.State.Finished
                resolve(this)
            }).catch((err)=>{
                console.log('download error', err)
                this.request = null
                this.state = Download.State.Failed
                reject(this)
            })*/

            const self = this
            var xhr = new XMLHttpRequest();
            xhr.open('GET', `https://api.nylas.com/files/${self.fileId}/download`, true);
            xhr.responseType = 'arraybuffer';
            xhr.setRequestHeader('Authorization', `Basic ${window.btoa(AccountStore.tokenForAccountId(self.accountId)+':')}`)
            xhr.onload = function(e) {
                if (this.status == 200) {
                    const blob = this.response;

                    let binary = '';
                    const bytes = new Uint8Array(blob);
                    const len = bytes.byteLength;
                    for (let i = 0; i < len; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    self.blob = `data:${self.contentType};base64,${window.btoa(binary)}`
                    self.state = Download.State.Finished

                    resolve(self)
                }
            };
            xhr.send();

        })

        return this.promise
    }

}

module.exports = EmailFileDownload