import { Mongo } from  'meteor/mongo';

export const Messages = new Mongo.Collection("Messages");
export const Projects = new Mongo.Collection("Projects");
export const CreatedUsers = new Mongo.Collection("CreatedUsers");
export const Quotes = new Mongo.Collection("Quotes");
export const Events = new Mongo.Collection("Events");
export const SlackMessages = new Mongo.Collection("SlackMessages");

const fileStore = new FS.Store.GridFS("files");

export const Files = new FS.Collection("files", {
    stores: [fileStore]
});

//todo add security
Files.allow({
    insert(){
        return true;
    },
    update(){
        return true;
    },
    remove(){
        return true;
    },
    download(){
        return true;
    }
});


Quotes.after.insert(function (userId, doc) {
    const event = {
        name: `Add new quote "${doc.name}"`,
        createAt: doc.createAt,
        projectId: doc.projectId,
        createBy: doc.createBy
    };
    Events.insert(event)
});

Quotes.after.update(function (userId, doc, fieldNames, modifier, options) {
    console.log("fieldNames", fieldNames)
    console.log("modifier", modifier)
    console.log("options", options)
    const event = {
        name: `update quote "${doc.name}"`,
        createAt: doc.createAt,
        projectId: doc.projectId,
        createBy: doc.createBy
    };
    Events.insert(event)
});
//todo after update revisions add new event
Quotes.after.remove(function (userId, doc) {
    const event = {
        name: `remove quote "${doc.name}"`,
        createAt: new Date(),
        projectId: doc.projectId,
        createBy: doc.createBy,
    };
    const filesId = doc.revisions.map(item=>item.fileId);

    Events.insert(event);
    Files.remove({_id: {$in: filesId}});
});