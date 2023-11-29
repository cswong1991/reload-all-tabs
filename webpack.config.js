/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: {
        options_ui: './src/options_ui/index.ts',
        service_worker: './src/service_worker/index.ts'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/options_ui/index.html',
            filename: 'options_ui.html',
            chunks: ['options_ui']
        }),
        new CopyPlugin({
            patterns: [
                { from: "src/icons", to: "icons" }
            ],
        }),
    ],
};