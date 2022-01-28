const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
    devtool: "eval-cheap-module-source-map", // 激活源码映射：它既能提供质量较好的源码映射，又能提供较高的构建速度。
    devServer: {
        static: "./",                        // 设置资源的起寻地址。
        compress: true,                      // 激活gzip。
        server: "http",                      // 设置网络传输协议。
        port: 8080,                          // 设置端口号。
        open: true,                          // 激活浏览器自启动。
    },
});
