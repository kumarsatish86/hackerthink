// fix-cloudflare-plugin.js
// This plugin fixes the "UnhandledSchemeError: Reading from 'cloudflare:sockets'" error

class FixCloudflarePlugin {
  constructor() {
    this.name = 'FixCloudflarePlugin';
  }

  apply(compiler) {
    // Fix cloudflare:sockets issues
    compiler.hooks.normalModuleFactory.tap(this.name, (factory) => {
      factory.hooks.beforeResolve.tap(this.name, (result) => {
        if (!result) return;
        
        // Handle cloudflare:sockets import
        if (result.request === 'cloudflare:sockets') {
          // Change the request to our stub module
          result.request = require.resolve('./cloudflare-stub.js');
        }
        
        return result;
      });
    });

    // Handle any missed resolutions
    compiler.hooks.compilation.tap(this.name, (compilation) => {
      compilation.hooks.normalModuleLoader.tap(this.name, (loaderContext, module) => {
        if (module.request && module.request.includes('cloudflare:sockets')) {
          module.request = require.resolve('./cloudflare-stub.js');
        }
      });
    });
  }
}

module.exports = FixCloudflarePlugin; 