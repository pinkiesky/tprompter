#!/usr/bin/env bash

# 1. Create and enter a new directory

# 2. Initialize a new Git repository (optional, but recommended)
git init

# 3. Create an initial README
echo "# My Node + TypeScript + Jest Project" > README.md

# 4. Initialize npm (accept all defaults with -y)
npm init -y

# 5. Install TypeScript, Jest, ts-jest, and @types/jest as dev dependencies
npm install --save-dev typescript jest ts-jest @types/jest

# 6. Initialize a default tsconfig.json
npx tsc --init

# 7. Create a Jest config; this automatically configures ts-jest
npx ts-jest config:init

# 8. Replace the default "test" script in package.json with one that runs Jest
sed -i 's/"test": "echo \\"Error: no test specified\\" && exit 1"/"test": "jest"/g' package.json

# 9. Create a .gitignore to exclude node_modules
echo "node_modules" > .gitignore

# 10. Create directories for source code and tests
mkdir src
mkdir tests

# 11. Add a simple TypeScript test to verify setup
cat <<EOT >> tests/example.test.ts
test('example test', () => {
  expect(true).toBe(true);
});
EOT

# (Optional) Stage and commit to Git
git add .
git commit -m "Initial commit with Node + TypeScript + Jest setup"
