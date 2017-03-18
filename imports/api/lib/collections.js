import { Mongo } from  'meteor/mongo';

export const Messages = new Mongo.Collection("Messages");
export const SalesRecords = new Mongo.Collection("SalesRecords");
export const CreatedUsers = new Mongo.Collection("CreatedUsers");
export const Quotes = new Mongo.Collection("Quotes");
export const Events = new Mongo.Collection("Events");
export const SlackMessages = new Mongo.Collection("SlackMessages");
export const SlackUsers = new Mongo.Collection("SlackUsers");
export const Settings = new Mongo.Collection('Settings');
export const Projects = new Mongo.Collection('Projects');

// const fileStore = new FS.Store.FileSystem("files");
//
// export const Files = new FS.Collection("files", {
//     stores: [fileStore]
// });

const fileStore = new FS.Store.S3("files", {
    accessKeyId: "AKIAJ3ONO2DPIHGYMGLA", //required
    secretAccessKey: "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", //required
    bucket: "pross-meteor-erp", //required
    folder: "quotes", //optional
});

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

SlackUsers.after.insert(function (userId, doc) {
    const email = doc.profile.email;
    if(!email) return;
    const user = Accounts.findUserByEmail(email);
    if(!user) return;
    Meteor.users.update({_id: user._id},{
        $set: {
            'slack': doc
        }
    })
});

SlackMessages.before.insert(function (userId, doc) {
    if(!doc.user) return;
    const user = Meteor.users.findOne({'slack.id': doc.user});
    if(!user) return;
    return doc.userId = user._id;
});
