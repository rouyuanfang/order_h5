const path = require("path");
const { defineConfig } = require("@vue/cli-service");
function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.module.rule("svg").exclude.add(resolve("src/icons")).end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();
  },
  css: {
    loaderOptions: {
      sass: {
        // 全局引入变量和 mixin
        additionalData: `
          @import "@/assets/scss/variable.scss";
        `,
      },
    },
  },
  // 配置反向代理
  devServer: {
    /*   proxy: {
        '/api': {
          target: 'https://172.31.120.61:8080/',
          ws: true,
          changeOrigin: true,
          pathRewrite: {
            '^/api': ''
          }
        }
      }, */
    // https: true
  },
  // outputDir: process.env.outputDir,
  // publicPath:'./',
  // optimization:{nodeEnv:false}
});
