Create a cli (Command Line Interface) application that scrapes the **current version** of this website:

https://memegen-link-examples-upleveled.netlify.app/

...and saves the first 10 images into a folder called "memes" within the directory of the new project. The image files should be named with a number with a leading zero, eg. `01.jpg`, `02.jpg`, etc.

Avoid using an "image scraper" or "image downloader" library that does multiple steps at once for you (eg. do not use [`image-downloader`](https://www.npmjs.com/package/image-downloader) or [`nodejs-file-downloader`](https://www.npmjs.com/package/nodejs-file-downloader) or similar) - break the task down into smaller steps and select libraries as necessary for each step.

Make sure that the meme images are "ignored" in Git - they should not show up in your repository.

The program should be able to run multiple times without throwing an error.

When you believe you are done, set up a test:

1. Create a directory called `.github` (there is a dot at the start)
2. Create a directory called `workflows` inside `.github`
3. Create a file called `test.yml` inside `workflows` containing the following code

```yaml
name: Test Project
on: push

jobs:
  test:
    name: Test Project
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 'latest'
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'pnpm'
      - name: Install project dependencies
        run: pnpm install
      - name: Create test file
        # Create a test file that will run index.js from the project
        # with Node.js and check whether
        # - No ./memes directory exists before the program runs
        # - The ./memes directory exists after the program runs
        # - The first 10 images have been downloaded to ./memes
        # - The 10 images have matching SHA-256 hashes
        # - The program can run multiple times without errors
        run: |
          cat > test.js <<'END_SCRIPT'
            import { exec } from 'node:child_process';
            import { hash } from 'node:crypto';
            import { existsSync } from 'node:fs';
            import { readdir, readFile } from 'node:fs/promises';
            import { promisify } from 'node:util';

            const execAsync = promisify(exec);

            if (existsSync('./memes')) {
              console.log(
                '❌ `node index.js` pre-run 1: The directory `memes` already exists',
              );
              process.exit(1);
            }

            await execAsync('node index.js');

            const expectedFileHashes = {
              '01.jpg': '41a1efb58477bbf47c2270097c6a241557a335814794abde5977399dfd7331ba',
              '02.jpg': 'c9f186504728df2d81b243c72f794d999d649687f6e5efc46388d0e021249c4b',
              '03.jpg': 'c8bb155a9857c813f0930a2f2219122ceb975d982fdf12b39175f39994e1cf67',
              '04.jpg': 'b5560e8098843d65060439e530707b32ec207540990aa7a715db78c3983f1018',
              '05.jpg': 'b1d802552e8a3909fe1d62f66350faf82c36eac9d088d50026116d933ab2f013',
              '06.jpg': 'bb9b0ece0ef301f912e0b54a3e7d45d92e44a307c4b3cee28a4b80330dfc9bc7',
              '07.jpg': '7a14f0161f259d9de48a0ff8a5ddeaf97154b0a39fa219f4b296e5ad31f86156',
              '08.jpg': '47dd2de3c1633e624c582010fd4ee9cca60a7e612835b4d89f98ca199da397d5',
              '09.jpg': '29774b4cff11307c3e849f0cc4a63b3711810aa9449652edf8d72276ba6cf7db',
              '10.jpg': 'de1e6994215d88ed2a4d82d8336c6049c479a22c7a7a53bfb95ef6fe4a3335d4',
            };

            // Read all files in directory and print the SHA-256 hash of each file
            const files = await readdir('./memes');

            const filesAsString = files.join(',');
            const expectedFilesAsString = Object.keys(expectedFileHashes).join(',');

            if (filesAsString !== expectedFilesAsString) {
              console.log(
                `❌ \`node index.js\` run 1: Files in directory \`memes\` (${filesAsString}) do not match expected files (${expectedFilesAsString})`,
              );
              process.exit(1);
            }

            console.log('✔️ `node index.js` run 1: All expected files exist');

            let anyFileHashesFailedMatch;

            for (const file of files) {
              const fileHash = hash('sha256', await readFile(`./memes/${file}`));

              if (fileHash !== expectedFileHashes[file]) {
                console.log(
                  `❌ \`node index.js\` run 1: Hash for \`memes/${file}\` ${fileHash} does not match expected hash ${expectedFileHashes[file]}`,
                );
                anyFileHashesFailedMatch = true;
              }
            }

            if (anyFileHashesFailedMatch) {
              process.exit(1);
            }

            console.log('✔️ `node index.js` run 1: All files match expected hashes');

            try {
              await execAsync('node index.js');
            } catch (error) {
              console.log(
                `❌ \`node index.js\` run 2: Error thrown during second run ("${error.message}")`,
              );
              process.exit(0);
            }

            console.log('✔️ `node index.js` run 2: No error thrown during second run');

            console.log('✔️ All tests passed!');
          END_SCRIPT
      - name: Run test file
        run: node test.js
```

## TODOs

- [ ] Clone the repository
- [ ] Create a repository
- [ ] Create a readme
- [ ] Set up ESLint config
- [ ] Create a `.gitignore` file and ignore the images by adding `memes`
- [ ] Create the `memes` folder
- [ ] Connect to https://memegen-link-examples-upleveled.netlify.app/
- [ ] Research methods to make request in Node.js
  - [ ] should we use a fetch request?
  - [ ] is this the same as connecting?
- [ ] Create a variable with the html string from the website
- [ ] From the html, extract all of the img src attributes (array of strings = array of urls)
- [ ] Limit the array of urls to the first 10 (maybe this can be done with the previous step)
- [ ] Loop over each of the first 10 URLs in the array
  - [ ] Request the image URL
  - [ ] Save the image data in a variable
  - [ ] Create the file name with the leading zero
  - [ ] Create the file with the file name
  - [ ] Put the image data inside of the file
- [ ] Test that the program runs multiple times without errors

Stretch goals:

- Make the application create your own custom meme (eg. `node index.js hello karl bender` would download an image with the top text of "hello", the bottom text of "karl", with the meme image of Bender)
- Add a nice progress indicator (either messages or a progress bar)

## Acceptance Criteria

- [ ] Preflight runs through without errors in your project
  - [ ] Link in your GitHub repo's About section: Replit demo
- [ ] [Drone bot](https://learn.upleveled.io/pern-extensive-immersive/modules/cheatsheet-tasks/#upleveled-drone) has been tagged and responded with a passing message
- [ ] Correct GitHub commit message format (see [Writing Commit Messages](https://learn.upleveled.io/pern-extensive-immersive/modules/cheatsheet-git-github/#writing-commit-messages))
