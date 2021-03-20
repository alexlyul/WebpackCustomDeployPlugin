 Webpack custom deploy plugin
============================

As soon as webpack generated a bundle you can deploy it or do anything with its content.
This plugin saves you some time because you do not need any watchers or reading from hard drive.

 Example usage
--------------------------------

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

 Description
------------------------

### destinationMapping
```
  { entry: 'main.js', path: ['serverPath', 'to', 'main.js'], isProduction: true },
  { entry: 'anotherIndexFile.js', path: ['serverPath', 'to', 'anotherIndexFile.js'], isProduction: false },
```

```entry```-s from ```destinationMapping```-option corresponds to **webpack entries**.
```isProductionMode: true/false``` tells plugin if it is a production build.
```entry```-s marked with ```isProductionMode: true``` is only delivered in production mode.
This prevents you from accidental writing to production files.


### deployer()
```deployer``` property should either return a Promise or to be an asynchronous function.
