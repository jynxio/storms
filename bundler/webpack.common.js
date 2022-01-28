const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./source/index.js",
    plugins: [
        new HtmlWebpackPlugin({ title: "" }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource",
            },
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../build"),
        clean: true,                               // 清除生成目录。
        pathinfo: false,                           // 提升构建性能：通过禁止为bundle生成模块的路径信息，以提高垃圾回收的性能，从而提高构建性能。
    },
};