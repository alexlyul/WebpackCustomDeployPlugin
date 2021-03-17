"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_1 = require("webpack");
const schema_utils_1 = require("schema-utils");
const utils_1 = require("./utils");
// schema for config object.
const configSchema = {
    type: 'object',
    properties: {
        destinationMapping: {
            instanceof: 'Array',
            description: 'Array of items with type: {\n' +
                '    entry: string,\n' +
                '    path: string[],\n' +
                '    isProduction: boolean,\n' +
                '}\n',
        },
        isProductionMode: {
            type: 'boolean',
            description: 'If "true" passed - plugin will deploy also files marked as production',
        },
        deployer: {
            instanceof: 'Function',
            description: 'Your deployment callback. Should deploy single file to destination, returns a Promise',
        },
    },
    additionalProperties: false,
};
const destinationMappingItemSchema = {
    instanceof: 'Object',
    properties: {
        entry: {
            type: 'string',
            description: 'Entry file name',
        },
        path: {
            instanceof: 'Array',
            description: 'Example: ["path", "to", "file.js"]',
        },
        isProduction: {
            type: 'boolean',
        },
    }
};
module.exports = class WebpackCustomDeploy {
    constructor(options) {
        schema_utils_1.validate(configSchema, options, { name: 'WebpackCustomDeploy' });
        for (const mappingItem of options.destinationMapping) {
            schema_utils_1.validate(destinationMappingItemSchema, mappingItem, { name: 'WebpackCustomDeploy:mappingItem' });
        }
        this.destinationMapping = options.destinationMapping;
        this.isProductionMode = options.isProductionMode;
        this.deployer = options.deployer;
    }
    apply(compiler) {
        const pluginName = 'WebpackCustomDeploy';
        compiler.hooks.assetEmitted.tapPromise(pluginName, (file, { content, compilation }) => {
            return new Promise(async (resolve) => {
                if (file.endsWith('.LICENSE.txt')) {
                    resolve();
                    return;
                }
                const currentEntryMappings = this.destinationMapping.filter((m) => m.entry === file);
                if (!currentEntryMappings.length) {
                    const e = new webpack_1.WebpackError(`No mapping found for ${file}. \n` +
                        'Add mapping info to "new DialfireDeploy({ destinationMapping: [ { ==> here <== } ] })"');
                    compilation.errors.push(e);
                    resolve();
                    return;
                }
                for (const mapping of currentEntryMappings) {
                    const path = mapping.path;
                    const pathString = path.join('/');
                    // skip production files
                    if (mapping.isProduction && !this.isProductionMode) {
                        continue;
                    }
                    console.log(utils_1.highlight(`DEPLOYING FILE: ${file} to PATH: ${pathString}` +
                        `${this.isProductionMode && mapping.isProduction ? ' [PRODUCTION FILE]' : ''}`));
                    try {
                        await this.deployer(path, content.toString());
                        console.log(utils_1.highlight(`DEPLOYED: ${file} to ${pathString}`));
                    }
                    catch (e) {
                        compilation.errors.push(e);
                        compilation.errors.push(new webpack_1.WebpackError(`Failed to publish file: ${path.join(',')}`));
                    }
                }
                resolve();
            });
        });
    }
};
