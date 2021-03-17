#Webpack custom deploy plugin
Once webpack generates a bundle you can do anything with its content.
It saves time because you do not need any watchers and reading from hard drive.

##Example usage
Inside webpack.config.js:
```
plugins: [
        new WebpackCustomDeploy({
            destinationMapping: [
                { entry: 'main.js', path: ['serverPath', 'to', 'main.js'], isProduction: true },
                { entry: 'anotherIndexFile.js', path: ['serverPath', 'to', 'anotherIndexFile.js'], isProduction: false },
            ],

            async deployer(path, fileContent) {
                // do anything with current bundle
                await http.put('your.server', {path, fileContent});
            },

            isProductionMode: true,
        })
]
```

##Description
###destinationMapping
```
  { entry: 'main.js', path: ['serverPath', 'to', 'main.js'], isProduction: true },
  { entry: 'anotherIndexFile.js', path: ['serverPath', 'to', 'anotherIndexFile.js'], isProduction: false },
```

Entries from ```destinationMapping``` option corresponds to webpack entries.
```isProductionMode: true/false``` tells plugin if it is a production build.
Entries marked with ```isProductionMode: true``` is only delivered in production mode.
This prevents you from accidental overwriting of production files.


###deployer()
```deployer``` property should be either return a Promise or be an asynchronous function.
