const path = require("path");

module.exports = {
  mode: "development",
  entry: ".//main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  resolve: {
    alias: {
      peerjs: process.env.NODE_ENV === "production" ? "peerjs/dist/peerjs.min.js" : "peerjs/dist/peerjs.js",
    },
  },
  devtool: "source-map",
};
