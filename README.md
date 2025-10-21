# PathForms

Prabhat
To sync with latest remote (Pathforms/PathForms):

```bash
git fetch upstream
git merge upstream/BRANCH
# fix required
git add -A
git commit -m "merge from upstream/BRANCH"
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

server deploy:

```bash
npm run build # generate out
# delete previous out: rm -rf /srv/data/PathForms/www/out
# send file
scp -r ./out/ NETID@play.math.illinois.edu:/srv/data/PathForms/www/
# give public read access
chmod -R o+rx /srv/data/PathForms/www/out

```

# Test change in nicola branch
