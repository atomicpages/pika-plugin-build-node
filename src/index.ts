import path from 'path';

import babelPluginDynamicImportSyntax from '@babel/plugin-syntax-dynamic-import';
import babelPluginImportMetaSyntax from '@babel/plugin-syntax-import-meta';
import babelPresetEnv from '@babel/preset-env';
import babelPluginDynamicImport from 'babel-plugin-dynamic-import-node-babel-7';
import builtinModules from 'builtin-modules';

import json from '@rollup/plugin-json';
import rollupBabel from 'rollup-plugin-babel';

export { manifest, beforeJob } from '@pika/plugin-build-node';

import { BuilderOptions as PikaBuilderOptions } from '@pika/types';
import { rollup } from 'rollup';

type ComplexPlugin = [string, Record<string, unknown>];
type Plugins = string[] | ComplexPlugin[];

type BuilderOptions = PikaBuilderOptions & {
    options: {
        sourcemap?: string;
        minNodeVersion?: string;
        entrypoint?: string | string[] | null;
        plugins?: Plugins;
    };
};

const DEFAULT_MIN_NODE_VERSION = '8';

function processPlugins(plugins?: Plugins) {
    if (!plugins) {
        return [];
    }

    return (plugins as any[]).map((plugin: string | ComplexPlugin) => {
        let m: Function;

        if (typeof plugin === 'string') {
            m = require(plugin)();
        } else if (Array.isArray(plugin) && plugin.length === 2) {
            m = require(plugin[0])(plugin[1]);
        } else {
            throw new Error('Expected string or config array (i.e. ["name", {/* config*/ }])');
        }

        return m;
    });
}

export async function build({ out, reporter, options = {} }: BuilderOptions): Promise<void> {
    const writeToNode = path.join(out, 'dist-node', 'index.js');
    const plugins = processPlugins(options.plugins);

    const result = await rollup({
        input: path.join(out, 'dist-src/index.js'),
        external: builtinModules as string[],
        plugins: [
            rollupBabel({
                babelrc: false,
                compact: false,
                presets: [
                    [
                        babelPresetEnv,
                        {
                            modules: false,
                            targets: { node: options.minNodeVersion || DEFAULT_MIN_NODE_VERSION },
                            spec: true,
                        },
                    ],
                ],
                plugins: [
                    babelPluginDynamicImport,
                    babelPluginDynamicImportSyntax,
                    babelPluginImportMetaSyntax,
                ],
            }),
            json({
                compact: true,
                indent: '\t',
                namedExports: true,
            }),
            ...plugins,
        ],
        onwarn: (warning, defaultOnWarnHandler) => {
            // Unresolved external imports are expected
            if (
                warning.code === 'UNRESOLVED_IMPORT' &&
                !(warning.source.startsWith('./') || warning.source.startsWith('../'))
            ) {
                return;
            }
            defaultOnWarnHandler(warning);
        },
    });

    await result.write({
        file: writeToNode,
        format: 'cjs',
        exports: 'named',
        sourcemap: options.sourcemap === undefined ? true : options.sourcemap,
    });

    reporter.created(writeToNode, 'main');
}
