const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
    mode: "production",
    devtool: 'source-map',
    entry: {
        options_ui: "./src/options_ui/index.ts",
        service_worker: "./src/service_worker/index.ts",
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/options_ui/index.html",
            filename: "options_ui.html",
            chunks: ["options_ui"],
        }),
        new CopyPlugin({
            patterns: [
                { from: "src/manifest.json", to: "manifest.json" },
                { from: "src/icons", to: "icons" }],
        }),
        new ZipPlugin({
            filename: "reload-all-tabs.zip"
        })
    ],
};
