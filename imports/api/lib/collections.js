import { Mongo } from  'meteor/mongo';

export const Messages = new Mongo.Collection('Messages');
export const Projects = new Mongo.Collection('Projects');
export const Files = new Mongo.Collection('Files');

//hooks
Files.after.insert(function (userId, doc) {
    Messages.update(
        {_id: doc.messageId},
        {$addToSet: {
            attachments: {
                id: this._id,
                name: doc.name
            }
        }}
    )
});