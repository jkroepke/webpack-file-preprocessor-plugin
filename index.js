const { RawSource } = require('webpack-sources');

/**
 * Webpack File Preprocessor Plugin
 */
class WebpackFilePreprocessorPlugin {
  constructor(options) {
    const userOptions = options || {};

    const defaultOptions = {
      debug: false,
    };

    this.options = Object.assign(defaultOptions, userOptions);
    this.plugin = this.plugin.bind(this);
  }

  validateOptions() {
    const { pattern, process } = this.options;

    return (
      (pattern instanceof RegExp)
      && (typeof process === 'function')
    );
  }

  plugin(compilation, callback) {
    if (this.options.debug === true) {
      console.info('\nPreprocessing Assets:\n');
    }

    // Loop through the compilation assets
    Object.keys(compilation.assets)
      .filter((filename) => this.options.pattern.test(filename))
      .forEach((filename) => {
        const asset = compilation.assets[filename];

        // Trigger the process callback
        const processed = this.options.process(asset.source(), filename);

        if (this.options.debug === true) {
          const size = asset.size();
          const processedSize = processed.length;
          const ratio = Number(100 - ((processedSize * 100) / size)).toPrecision(3);

          console.info(` - ${filename} \t\t${size}B -> ${processedSize}B\t\t[${ratio} %]`);
        }

        // Replace the source file with minified html
        // eslint-disable-next-line no-param-reassign
        compilation.assets[filename] = new RawSource(processed);
      });

    if (this.options.debug === true) {
      console.info('\n');
    }

    callback();
  }

  apply(compiler) {
    if (!this.validateOptions()) {
      console.warn('WARNING WebpackFilePreprocessorPlugin instantiated with invalid options.');
      return;
    }

    if (compiler.hooks) {
      // Webpack 4
      compiler.hooks.emit.tapAsync('WebpackFilePreprocessorPlugin', this.plugin);
    } else {
      // Webpack 3
      compiler.plugin('emit', this.plugin);
    }
  }
}

module.exports = WebpackFilePreprocessorPlugin;
