const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        index: "./src/index.js" // Assuming you're using JavaScript instead of TypeScript
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    "babel-loader" // You might need Babel to transpile JavaScript
                ]
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "manifest.json", to: "../manifest.json" }
            ]
        }),
        ...getHtmlPlugins(["index"])
    ],
    resolve: {
        extensions: [".js"] // No need for .tsx and .ts extensions
    },
    output: {
        path: path.join(__dirname, "dist/js"),
        filename: "[name].js"
    }
};

function getHtmlPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HTMLPlugin({
                title: "React extension",
                filename: `${chunk}.html`,
                chunks: [chunk]
            })
    );
}
