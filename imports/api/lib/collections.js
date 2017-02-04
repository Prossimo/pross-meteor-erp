import { Mongo } from  'meteor/mongo';
import { FILES, MESSAGES, PROJECTS} from '../constatnts/collections'

export const Messages = new Mongo.Collection(MESSAGES);
export const Projects = new Mongo.Collection(PROJECTS);
export const Files = new Mongo.Collection(FILES);
export const CreatedUsers = new Mongo.Collection("CreatedUsers");

//todo rewrite hooks
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