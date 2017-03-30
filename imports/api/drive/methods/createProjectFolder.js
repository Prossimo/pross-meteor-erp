import SimpleSchema from 'simpl-schema';
import createFolder from './createFolder';
import { prossDocDrive } from '../../config/config';

const { projectParentFolderId }  = prossDocDrive;

export default new ValidatedMethod({
    name: 'drive.createProjectFolder',
    validate: new SimpleSchema({
        name: { type: String },
    }).validator(),
    run({ name }) {
        const projectName = `00[##### ${name}]`;
        return createFolder.call({ name: projectName, parent: projectParentFolderId });
    },
})
