const fs = require('fs');
const path = require('path');

const pkg = path.join(__dirname, 'pkg');
const folders = fs.readdirSync(pkg);

console.assert(fs.existsSync(pkg), 'pkg directory expected to exist');

console.assert(
    Array.prototype.includes.apply(folders, [
        'dist-node',
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

console.assert(
    fs.readFileSync(path.join(__dirname, 'pkg/dist-node/index.js')).toString() ===
        `'use strict';

var foo=true;var foo$1 = {foo:foo};

console.log(foo$1);
//# sourceMappingURL=index.js.map
`,
    'FIles do not match'
);
