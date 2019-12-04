/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const pkg = path.join(__dirname, 'pkg');
const folders = fs.readdirSync(pkg);

const assert = (assertion, ...messages) => {
    if (!assertion) {
        console.error(messages);
        throw new Error(messages);
    }
};

try {
    assert(fs.existsSync(pkg), 'pkg directory expected to exist');

    assert(
        Array.prototype.includes.apply(folders, [
            'ddist-node',
            'dist-src',
            'dist-types',
            'package.json',
        ]),
        `Expected to see:\n${JSON.stringify(
            ['dist-node', 'dist-src', 'dist-types', 'package.json'],
            null,
            4
        )}\n\nbut saw:\n\n${JSON.stringify(folders, null, 4)}`
    );

    assert(
        fs.readFileSync(path.join(__dirname, 'pkg/dist-node/index.js')).toString() ===
            `'use strict';

var foo=true;var foo$1 = {foo:foo};

console.log(foo$1);
//# sourceMappingURL=index.js.map
`,
        'FIles do not match'
    );
} catch (e) {
    console.error(e.messages);
    process.exit(1);
}
