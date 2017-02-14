import { Mongo } from  'meteor/mongo';

export const Messages = new Mongo.Collection("Messages");
export const Projects = new Mongo.Collection("Projects");
export const CreatedUsers = new Mongo.Collection("CreatedUsers");
export const Quotes = new Mongo.Collection("Quotes");
export const Events = new Mongo.Collection("Events");

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
        createBy: doc.createBy,
        meta: {
            quoteId: doc._id,
            fileId: doc.attachedFile.fileId
        }
    };
    Events.insert(event)
});
//todo after update revisions add new event
Quotes.after.remove(function (userId, doc) {
    const event = {
        name: `Remove quote "${doc.name}"`,
        createAt: new Date(),
        projectId: doc.projectId,
        createBy: doc.createBy,
        meta: {
            quoteId: doc._id,
            fileId: doc.attachedFile.fileId
        }
    };
    Events.insert(event);
    Files.remove({_id: doc.attachedFile.fileId});
});