"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlight = void 0;
function highlight(s) {
    return '\x1b[46m' + s + '\x1b[0m';
}
exports.highlight = highlight;
