const path = require('path')

module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/app/main/entrypoint.ts',
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
        modules: [path.join(__dirname, 'src'), 'node_modules'],
    },
    optimization: {
        minimize: false, // MySQL errors otherwise
    },
}
