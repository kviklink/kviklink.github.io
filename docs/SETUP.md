# Project Setup

## Prerequisites
-   `pnpm`

## Init project (with `pnpm` workspaces)
-   `pnpm init`
-   `mkdir apps` and `mkdir libs`
-   create `pnpm-workspace.yaml` in the root of the project with the following
    content:
    ```yaml
    # ./pnpm-workspace.yaml
    packages:
        - 'apps/*'
        - 'libs/*'
    ```
-   Add root development dependencies
    -   `pnpm install -D -w typescript @types/node rimraf`

-   Create `tsconfig.*.json` files
    -   `tsconfig.base.json` to define the base of all TS-configs
    -   `tsconfig.json` to provide a TS-config for the project root
        (this is needed )

-   Prettier
    -   `pnpm install -D -w prettier`
    -   Create `.editorconfig`
    -   Create `.prettierrc.json` and `.prettierignore`

-   ESlint
    -   `pnpm install -D -w eslint eslint-plugin-node @typescript-eslint/eslint-plugin @typescript-eslint/parser`
    -   Create `eslintrc.json`

## Init Svelte (SvelteKit) application
-   `cd apps`
-   `pnpm create svelte@latest ui`
    -   Which Svelte app template: **Skeleton project**
    -   Add type checking with TypeScript: **Yes, using TypeScript syntax**
    -   Select additional options:
        -   playwright
        -   vitest
        -   **try the Svelte 5 preview**

-   Install svelte prettier plugin
    -   `pnpm install -D -w prettier-plugin-svelte`
    -   Add the following lines to `.pretierrc.json`:  
        ```json
        {
            ...,

            "plugins": ["prettier-plugin-svelte"],
            "overrides": [
                {
                    "files": "*.svelte",
                    "options": {
                        "parser": "svelte"
                    }
                }
            ],
            ...
        }
        ```

-   Install `@sveltejs/adapter-static` and configure in `svelte.config.js`
-   Setup `shadcn-svelte`
    -   `pnpx svelte-add@latest tailwindcss`
    -   `pnpx install`
    -   `pnpx shadcn-svelte@latest init`
        -   TypeScript: yes
        -   Style: New York
        -   Base Color: Zinc
        -   Global CSS file: src/app.pcss
        -   Tailwind Config: tailwind.config.cjs
        -   Configure Import Alias: $lib/components
        -   Configure Import Alias: $lib/utils
        

## Init a library
-   `cd libs` and `mkdir <lib_name>` and `cd <lib_name>`

-   Create `src/index.ts`

-   Create `package.json` with the following content
    ```json
    {
        "name": "@libs/<lib_name>",
        "version": "1.0.0",
        "description": "",
        "main": "src/index.ts",
        "//main": "build/index.js",
        "//types": "build/index.d.ts",
        "scripts": {
            "build": "tsc",
            "clean:build": "rimraf build",
            "clean:nm": "rimraf node_modules"
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "devDependencies": {}
    }
    ```

-   Create `tsconfig.json` file for the library with the following content
    ```json
    {
        "extends": "../../tsconfig.base.json",
        "compilerOptions": {
            /* Projects */
            "target": "es2016",     /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */

            /* Modules */
            "module": "commonjs",   /* Specify what module code is generated. */
            "rootDir": "./src",     /* Specify the root folder within your source files. */

            /* Emit */
            "declaration": true,    /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
            "outDir": "./build"     /* Specify an output folder for all emitted files. */
        }
    }
    ```
