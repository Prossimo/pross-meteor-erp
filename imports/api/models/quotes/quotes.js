import Events from '../events/events'
import Files from '../files/files'

const Quotes = new Mongo.Collection('Quotes')

Quotes.after.insert((userId, doc) => {
    const event = {
        name: `Add new quote "${doc.name}"`,
        createAt: doc.createAt,
        projectId: doc.projectId,
        createBy: doc.createBy
    }
    Events.insert(event)
})

Quotes.after.update((userId, doc, fieldNames, modifier, options) => {
    const event = {
        name: `update quote "${doc.name}"`,
        createAt: doc.createAt,
        projectId: doc.projectId,
        createBy: doc.createBy
    }
    Events.insert(event)
})
//todo after update revisions add new event
Quotes.after.remove((userId, doc) => {
    const event = {
        name: `remove quote "${doc.name}"`,
        createAt: new Date(),
        projectId: doc.projectId,
        createBy: doc.createBy,
    }
    const filesId = doc.revisions.map(item => item.fileId)

    Events.insert(event)
    Files.remove({_id: {$in: filesId}})
})

export default Quotes
