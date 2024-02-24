"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => vitePluginCesium
});
module.exports = __toCommonJS(src_exports);
var import_fs_extra = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));
var import_rollup_plugin_external_globals = __toESM(require("rollup-plugin-external-globals"));
var import_serve_static = __toESM(require("serve-static"));
function vitePluginCesium(options = {}) {
  const {
    rebuildCesium = false,
    devMinifyCesium = false,
    cesiumBuildRootPath = "node_modules/cesium/Build",
    cesiumBuildPath = "node_modules/cesium/Build/Cesium/"
  } = options;
  let base = "/";
  let CESIUM_BASE_URL = "cesium/";
  let outDir = "dist";
  let isBuild = false;
  return {
    name: "vite-plugin-cesium",
    config(c, { command }) {
      var _a;
      isBuild = command === "build";
      if (c.base !== void 0) {
        base = c.base;
        if (base === "")
          base = "./";
      }
      if ((_a = c.build) == null ? void 0 : _a.outDir) {
        if (c.root !== void 0) {
          outDir = import_path.default.join(c.root, c.build.outDir);
        } else {
          outDir = c.build.outDir;
        }
      }
      CESIUM_BASE_URL = base + CESIUM_BASE_URL;
      const userConfig = {};
      if (!isBuild) {
        userConfig.define = {
          CESIUM_BASE_URL: JSON.stringify(CESIUM_BASE_URL)
        };
      } else {
        if (rebuildCesium) {
          userConfig.build = {
            assetsInlineLimit: 0,
            chunkSizeWarningLimit: 5e3,
            rollupOptions: {
              output: {
                intro: `window.CESIUM_BASE_URL = "${CESIUM_BASE_URL}";`
              }
            }
          };
        } else {
          userConfig.build = {
            rollupOptions: {
              external: ["cesium"],
              plugins: [(0, import_rollup_plugin_external_globals.default)({ cesium: "Cesium" })]
            }
          };
        }
      }
      return userConfig;
    },
    configureServer({ middlewares }) {
      const cesiumPath = import_path.default.join(cesiumBuildRootPath, devMinifyCesium ? "Cesium" : "CesiumUnminified");
      middlewares.use(import_path.default.posix.join("/", CESIUM_BASE_URL), (0, import_serve_static.default)(cesiumPath, {
        setHeaders: (res, path2, stat) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
        }
      }));
    },
    async closeBundle() {
      if (isBuild) {
        try {
          await import_fs_extra.default.copy(import_path.default.join(cesiumBuildPath, "Assets"), import_path.default.join(outDir, "cesium/Assets"));
          await import_fs_extra.default.copy(import_path.default.join(cesiumBuildPath, "ThirdParty"), import_path.default.join(outDir, "cesium/ThirdParty"));
          await import_fs_extra.default.copy(import_path.default.join(cesiumBuildPath, "Workers"), import_path.default.join(outDir, "cesium/Workers"));
          await import_fs_extra.default.copy(import_path.default.join(cesiumBuildPath, "Widgets"), import_path.default.join(outDir, "cesium/Widgets"));
          if (!rebuildCesium) {
            await import_fs_extra.default.copy(import_path.default.join(cesiumBuildPath, "Cesium.js"), import_path.default.join(outDir, "cesium/Cesium.js"));
          }
        } catch (err) {
          console.error("copy failed", err);
        }
      }
    },
    transformIndexHtml() {
      const tags = [
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: CESIUM_BASE_URL + "Widgets/widgets.css"
          }
        }
      ];
      if (isBuild && !rebuildCesium) {
        tags.push({
          tag: "script",
          attrs: {
            src: CESIUM_BASE_URL + "Cesium.js"
          }
        });
      }
      return tags;
    }
  };
}
