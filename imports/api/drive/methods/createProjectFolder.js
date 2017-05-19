import SimpleSchema from 'simpl-schema';
import createFolder from './createFolder';
import listFiles from './listFiles';
import copyFiles from './copyFiles';
import { Projects, Settings } from '../../models';

export default new ValidatedMethod({
  name: 'drive.createProjectFolder',
  validate: new SimpleSchema({
    name: { type: String },
    projectId: { type: String },
  }).validator(),
  run({ name, projectId }) {
    const { value: projectParentFolderId } = Settings.findOne({ key: 'PROJECT_ROOT_FOLDER' });
    const { value: projectTemplateFolder } = Settings.findOne({ key: 'PROJECT_TEMPLATE_FOLDER' });
    const projectName = `##### ${name}`;
    const taskName = `Tasks`;
    const { id: folderId } =  createFolder.call({ name: projectName, parent: projectParentFolderId });
    const { id: taskFolderId } = createFolder.call({ name:  taskName, parent: folderId });
    Projects.update(projectId, {
      $set: {
        folderId,
        taskFolderId,
      },
    });

    // copy template to new created folder
    const { files } = listFiles.call({ query: `'${projectTemplateFolder}' in parents` });
    files.forEach((file)=> {
      copyFiles.call({ fileId: file.id, parentId: folderId });
    });
  },
});
