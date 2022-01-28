const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    devtool: "nosources-source-map",  // 激活源码映射：它能在不暴露源代码的前提下反馈调用栈的情况，不过它会暴露文件结构和文件名。
    optimization: {
        minimizer: [
            "...",                    // 压缩bundle的js。
            new CssMinimizerPlugin(), // 压缩bundle的css。
        ],
    },
});
