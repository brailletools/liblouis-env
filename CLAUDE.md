# Working in this repo

- Never run `git commit` or `git push` in this repository. The user reviews all changes in their editor and commits themselves. Leave the working tree with unstaged/uncommitted changes for review.
- When fixing a bug, find the root cause rather than patching the symptom — check whether the same assumption or logic is duplicated elsewhere (e.g. a CI workflow with its own hard-coded dependency list, a parallel implementation in another file/language) before considering a fix complete.
