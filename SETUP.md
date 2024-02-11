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
        "//main": "dist/index.js",
        "//types": "dist/index.d.ts",
        "scripts": {
            "build": "tsc",
            "clean:dist": "rimraf dist",
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
            "outDir": "./dist"      /* Specify an output folder for all emitted files. */
        }
    }
    ```
