# @djthoms/plugin-build-node

> A [@pika/pack](https://github.com/pikapkg/pack) build plugin.
> Adds a Node.js distribution to your package, built & optimized to run on [Node.js](https://nodejs.org/). If no other distribution is included with your package, many other tools & bundlers can understand this format as well.

In addition to all the great things pika offers, this plugin is a super set of the `@pika/plugin-bundle-node` plugin, providing bundle support for JSON files and offering you the ability to add extra rollup plugins to the build flow for your CJS modules.

## Motivation
The main motivation is to support JSON bundling and provide a way to add extra rollup plugins.

1. Importing and bundling JSON files leads to failure before `@pika/plugin-bundle-node` can execute
2. I just want JSON files to be bundled, I don't need the every node module injected to `dist-node/index.js`
3. No way to control which rollup plugins are executed by pika

## Limitations
Currently this works with `@pika/plugin-ts-standard-pkg`. The standard `@pika/plugin-standard-pkg` is **not supported**.

## Install

```sh
# npm:
npm install @pika/pack @pika/plugin-build-node @djthoms/plugin-build-node --save-dev
# yarn:
yarn add @pika/pack @pika/plugin-build-node @djthoms/plugin-build-node --dev
```

Note: `@pika/pack` and `@pika/plugin-build-node` are peer dependencies -- you need to install these for this plugin to work.

## Usage

> Disclaimer: This plugin is for advanced usage only. Consider alternatives before resorting to this plugin. Refrain from overriding the default babel settings unless absolutely necessary.

```json
{
    "name": "example-package-json",
    "version": "1.0.0",
    "@pika/pack": {
        "pipeline": [
            [
                "@pika/plugin-ts-standard-pkg"
            ],
            [
                "@djthoms/plugin-build-node", // calls @pika/plugin-build-node internally
                {
                    "plugins": [
                        "@rollup/plugin-beep",
                        [ // configure plugins using duples -- kind of like how we configure @babel/preset-env ;)
                            "@rollup/plugin-strip",
                            {
                                "sourceMap": false
                            }
                        ]
                    ]
                }
            ]
        ]
    }
}
```

For more information about @pika/pack & help getting started, [check out the main project repo](https://github.com/pikapkg/pack).

## Options

| Option             | Type     | Default Value | Description                                                                                                                                                                                        |
|--------------------|----------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `"sourcemap"`      | boolean  | `true`          | Adds a [source map](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) for this build.                                                                                            |
| `"minNodeVersion"` | string   | `"8"`           | This plugin will build your package for the current minimum [Node.js LTS](https://github.com/nodejs/Release) major version. This option allows you to target later versions of Node.js only.       |
| `"entrypoint"`     | string   | `"main"`        | Customize the package.json manifest entrypoint set by this plugin. Accepts either a string, an array of strings, or `null` to disable entrypoint. Changing this is not recommended for most usage. |
| `"plugins"`        | string[] | `[]`            | Configure rollup by adding extra plugins. Be sure to install all related rollup plugins otherwise the build will fail!                                                                             |

## Result

1. Adds a Node.js distribution to your built package: `dist-node/index.js`
2. Common.js (CJS) Module Syntax
3. Bundles all JSON files by default
4. Transpiled to run on Node.js LTS (Currently, supports Node.js version v6+)
5. Adds a "main" entrypoint to your built `package.json` manifest.
