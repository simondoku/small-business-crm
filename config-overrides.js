// config-overrides.js
const { override, adjustStyleLoaders, addWebpackPlugin, addBabelPlugin } = require('customize-cra');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');

module.exports = override(
  // Add Babel plugins for optimization
  addBabelPlugin('@babel/plugin-transform-runtime'),
  
  // Optimize CSS
  adjustStyleLoaders(({ use: [, css, postcss, resolve, processor] }) => {
    css.options.sourceMap = process.env.NODE_ENV !== 'production';
    
    // Optimize CSS with cssnano in production
    if (postcss) {
      postcss.options.sourceMap = process.env.NODE_ENV !== 'production';
      
      // Add cssnano for production only
      if (process.env.NODE_ENV === 'production') {
        const cssnanoOptions = {
          preset: ['default', {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: true,
          }],
        };
        
        // Updated for compatibility with newer PostCSS loader
        if (!postcss.options.postcssOptions) {
          postcss.options.postcssOptions = {};
        }
        
        if (!postcss.options.postcssOptions.plugins) {
          postcss.options.postcssOptions.plugins = [];
        }
        
        if (Array.isArray(postcss.options.postcssOptions.plugins)) {
          postcss.options.postcssOptions.plugins.push(require('cssnano')(cssnanoOptions));
        } else {
          const existingPlugins = postcss.options.postcssOptions.plugins || {};
          postcss.options.postcssOptions.plugins = [
            ...Object.values(existingPlugins),
            require('cssnano')(cssnanoOptions)
          ];
        }
      }
    }
  }),
  
  // Customize webpack configuration for production
  (config) => {
    // Only apply optimizations in production
    if (process.env.NODE_ENV === 'production') {
      // Optimize chunk splitting
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                // Get the name of the npm package
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                // npm package names are URL-safe, but some servers don't like @ symbols
                return `npm.${packageName.replace('@', '')}`;
              },
            },
            // Group chart.js separately as it's large
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
              name: 'charts',
              priority: 20,
            },
          },
        },
        // Use Terser for minification with specific options
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              parse: {
                ecma: 8,
              },
              compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
                drop_console: true, // Remove console.logs in production
              },
              mangle: {
                safari10: true,
              },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
            parallel: true,
            extractComments: false,
          }),
        ],
      };
      
      // Add compression plugin for gzipped assets
      config.plugins.push(
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240, // Only compress files > 10kb
          minRatio: 0.8, // Only compress if compression ratio is better than 0.8
        })
      );
      
      // Only add the bundle analyzer when explicitly requested
      if (process.env.ANALYZE) {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-report.html',
          })
        );
      }
    }
    
    return config;
  }
);