### Run app

```
$ npm install
$ npm start
```

### Server URLs
- Stage server: https://crm-test.mavrik.build
- Production server: https://crm.mavrik.build


### Help links:
- Link to a process diagrams: https://drive.google.com/drive/folders/0BwlkF3vox8cEenNLNkFHMzN0bW8?usp=sharing
- Link to a process diagram: https://drive.google.com/open?id=0B-guFXEigZ5pR2lwOXc1Q3dQQUU
- User Stories https://docs.google.com/spreadsheets/d/1ZOcEC-EGrV52NcyFLXONuiL6XBQHvOIT5w9V2MGAMRo/edit?usp=sharing
- Schema Spreadsheet: https://docs.google.com/spreadsheets/d/1eRJnumg0CAMA79zud0k4TbK1YEZsTTrYCPlsBrNt7X0/edit?usp=sharing


## Github Workflow

This project uses the git forking workflow, https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow

Write commit messages "in the imperative mood". Read this if you haven't already: http://chris.beams.io/posts/git-commit/

Each commit should do one thing. It's no problem making lots of small commits, it's actualy much better than infrequent large commit because they are easier to review.

We use the Pull Request system of github.

`dev` branch is just our `master` branch.



#### Get Started

1. You first need to fork the repo(https://github.com/Prossimo/pross-meteor-erp).
2. Clone your own private repo
    ```
    $ git clone git@github.com:<username>/pross-meteor-erp.git
    ```

3. Add remote upstream
    ```
    $ git remote add upstream git@github.com:Prossimo/pross-meteor-erp.git
    ```

#### Creating a PR

> DON'T USE `git pull` command for updating other changes, you can use `git fetch` and `git rebase` to update changes from `upstream`

1. Fetch the upstream 
    ```
    $ git fetch upstream
    ```
    
2. Rebase to *`upstream/dev`* to update changes from others
    ```
    $ git rebase upstream/dev
    ```
    
  *If you have conflict , you have to resolve each conflict on each commit , do it manually or add `kdiff3` / `Beyond Compare` or anything that fit you , add these modification and do `$ git rebase --continue` until you cleared the conflicts.*
  
3. Do your work, *make commits*, you should create directly a PR and *push your work frequently*.

4. Test your code.

5. You can now push your code.
  * If the branch is new you just run ```$ git push origin myNewBranch``` 
  * If you had rebase you need to force the ```$ git push origin myNewBranch -f```
  
6. Create the PR from new commits of `origin` into `upstream/dev`.



**More you rebase your branch often, less you get problems. So don't wait ! You should rebase each time a commit is added to the upstream/dev.**

**DISCLAIMER** : Use *`push -f`* only with **Fork and PR project** like here, never on a project were everyone is working on the **same remote**. Your rewrite commits history.

> DON'T MERGE yourself PR, it should be accomplished by Project Manager or Git Manager after review.

**Do *`Squash and merge`* so that `upstream`'s commits history is not messy.**
