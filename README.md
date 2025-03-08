# PathForms

To sync with latest remote (Pathforms/PathForms):

```bash
git fetch upstream
git merge upstream/haochen
# fix required
git add -A
git commit -m "merge from upstream/haochen"
git push
```

Run:

ensure that npm or pnpm is installed

```bash
pnpm --version
```

To run in localhost:3000 :

first install the required dependencies

```bash
pnpm install
```

run in local browser:

```bash
pnpm dev
```
