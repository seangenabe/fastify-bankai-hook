# fastify-bankai-hook

Fastify plugin for [bankai](https://github.com/choojs/bankai) v9.

## Usage

```javascript
const Path = require('path')
const fastify = require('fastify')()

fastify.register(require('@seangenabe/fastify-bankai-hook'), {
  prefix: '/',
  entry: Path.join(__dirname, 'client.js')
})
```

## Plugin options

* entry: The Browserify entry point for your Bankai app.
* opts: Bankai options. Refer to their [documentation](https://github.com/choojs/bankai#api) for more info. `quiet` defaults to `true` if not defined.
