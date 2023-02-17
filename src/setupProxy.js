const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/humaans",
    (req, res, next) => {
      console.log("*******************************************************");
      console.log("*******************************************************");
      console.log("*******************************************************");
      console.log("*******************************************************");
      console.log("*******************************************************");
      console.log("*******************************************************");
      next();
    },
    createProxyMiddleware({
      target: "https://app.humaans.io",
      changeOrigin: true,
      pathRewrite: {
        "^/api/humaans": "/api",
      },
      logLevel: "debug",
    })
  );
};
