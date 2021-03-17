import type {Compiler} from 'webpack';
import {WebpackError} from 'webpack';
import {validate} from 'schema-utils';
import {highlight} from './utils';
import type {TFileDeployer, TMapping} from './types';
import { configSchema, destinationMappingItemSchema } from './types';



class WebpackCustomDeploy {
    protected destinationMapping: TMapping;
    protected isProductionMode: boolean;
    protected deployer: TFileDeployer;

    constructor(options: {
        destinationMapping: TMapping, isProductionMode: boolean, deployer: TFileDeployer
    }) {
        validate(configSchema, options, {name: 'WebpackCustomDeploy'});
        for (const mappingItem of options.destinationMapping) {
            validate(destinationMappingItemSchema, mappingItem, {name: 'WebpackCustomDeploy:mappingItem'})
        }

        this.destinationMapping = options.destinationMapping;
        this.isProductionMode = options.isProductionMode;
        this.deployer = options.deployer;
    }

    apply(compiler: Compiler) {
        const pluginName = 'WebpackCustomDeploy';

        compiler.hooks.assetEmitted.tapPromise(pluginName, (file, {content, compilation }) => {
            return new Promise(async (resolve) => {
                if (file.endsWith('.LICENSE.txt')) {
                    resolve();
                    return;
                }

                const currentEntryMappings = this.destinationMapping.filter((m) => m.entry === file);

                if (!currentEntryMappings.length) {
                    const e = new WebpackError(`No mapping found for ${file}. \n` +
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

                    console.log(
                        highlight(
                            `DEPLOYING FILE: ${file} to PATH: ${pathString}` +
                            `${this.isProductionMode && mapping.isProduction ? ' [PRODUCTION FILE]' : ''}`
                        )
                    );


                    try {
                        await this.deployer(path, content.toString());
                        console.log(highlight(`DEPLOYED: ${file} to ${pathString}`));
                    } catch (e) {
                        compilation.errors.push(e);
                        compilation.errors.push(new WebpackError(`Failed to publish file: ${path.join(',')}`));
                    }
                }

                resolve();
            });
        });
    }
}


module.exports = WebpackCustomDeploy;
