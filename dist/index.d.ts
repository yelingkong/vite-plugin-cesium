import { Plugin } from 'vite';

interface VitePluginCesiumOptions {
    /**
     * rebuild cesium library, default: false
     */
    rebuildCesium?: boolean;
    devMinifyCesium?: boolean;
    cesiumBuildRootPath?: string;
    cesiumBuildPath?: string;
}
declare function vitePluginCesium(options?: VitePluginCesiumOptions): Plugin;

export { vitePluginCesium as default };
