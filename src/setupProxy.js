const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  console.log("*******************************************************");
  console.log("*******************************************************");
  console.log("*******************************************************");
  console.log("*******************************************************");
  console.log("*******************************************************");
  console.log("*******************************************************");

  app.use(
    "/api/humaans",
    createProxyMiddleware({
      target: "https://app.humaans.io/api",
      changeOrigin: true,
      logLevel: "debug",
    })
  );
};
