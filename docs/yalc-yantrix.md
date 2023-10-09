In this guide, we will walk through the process of setting up a project that uses a locally developed package (**yantrix**) which is not yet published to **npm**. We will use **Yalc**, a package manager for local development, to manage the local package installation and linking.

## Prerequisites

Before you begin, make sure you have the following installed on your computer:
- **Node.js** (version 16 or above).
- **Yarn** (installed globally).
- **Yalc** (installed globally).

## Projects Setup

### 1. Set Up Local Package (yantrix)

First, let's set up the yantrix package:
1) Clone the yantrix repository: **`git clone https://github.com/tfcp68/yantrix.git`**
2) Install all dependencies using the command: **`yarn`**
3) Build the all packages using the command: **`yarn build`**

### 2. Publish yantrix Locally using Yalc

Since **yantrix** is a monorepository, it already has a built-in script to publish all its packages locally. In the root directory of the **yantrix** package, just run the following command:
```bash
yarn publish:local
```

This executes the **`yalc push --replace`** for all **yantrix** packages and creates a folder in the **`%LOCALAPPDATA%`** directory containing the packages, so you can use it if you need to publish an individual **yantrix** package.

### 3. Set Up Consumer Project (battle-farm)

Now, let's set up the **battle-farm** project, which will use the locally published **yantrix** packages:
1) Clone the **battle-farm** repository: **`git clone https://github.com/tfcp68/battle-farm.git`**.
2) Install all dependencies using the command: **`yarn`**.
3) Install the locally published **yantrix** packages using the monorepository package installation syntax: **`yalc add @yantrix/automata`**. This will create symlinks to the **yantrix** packages in the **`battle-farm`**.

### 4. Start Developing

Now, **battle-farm** project is set up to use the locally published **yantrix** package. You can start developing **battle-farm** project and import the **yantrix** package in code as if it were a regular **npm** package:
```typescript
import { SomeFunction } from '@yantrix/utils';
import { AnotherFunction } from '@yantrix/automata';
import { YetAnotherFunction } from '@yantrix/mermaid';
```

### 5. Updating the yantrix Package

During development, if you make changes to the **yantrix** package, you need to republish it locally using Yalc and then update it in the **battle-farm** project. You can use the same command as for local publishing:
```bash
yarn publish:local
```

It will update all **yantrix** packages in the local registry, and since **Yalc** uses symlinks, it will update the **yantrix** dependency packages in **battle-farm** accordingly.

### 7. Cleaning Up

Remember that **Yalc** is primarily intended for local development and sharing code between projects during development. Before publishing your **battle-farm** project to production or sharing it with others, make sure to remove the local dependency and install the official **npm** version of the **yantrix** packages.

To remove the local dependency in the **battle-farm** project directory, remove the locally linked package:
```bash
yalc remove @yantrix/<package-name>
```

## Conclusion

Congratulations! You've successfully set up a TypeScript project with a locally developed package (**yantrix**) using **Yalc**. You can now start developing your **battle-farm** project with the benefit of using a local package in the development phase. Remember to manage your dependencies carefully and update the packages as needed during development. When ready for production or sharing with others, switch back to using the official **npm** packages.