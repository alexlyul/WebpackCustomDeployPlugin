import { Schema } from 'schema-utils/declarations/validate';

export type TFileDeployer = (path: string[], fileContent: string) => Promise<void>;
export type TMapping = {
    entry: string,
    path: string[],
    isProduction: boolean,
}[];


// schema for config object.
export const configSchema:Schema = {
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

export const destinationMappingItemSchema:Schema = {
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
}
