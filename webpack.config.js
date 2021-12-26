import { dirname as pathDir, join as joinPath } from "path";
import { fileURLToPath } from "url";
const dir = pathDir(fileURLToPath(import.meta.url));

import HTMLPlugin from "html-webpack-plugin";

export default {
    mode: "production",

    entry: joinPath(dir, "src", "index.js"),
    output: {
        path: joinPath(dir, "dist"),
        filename: "index.js",
    },

    module: {
        rules: [
            {
                test: /\.wgsl$/,
                type: "asset/source",
            },
            {
                test: /\.html$/,
                loader: "html-loader",
            },
        ],
    },

    plugins: [
        new HTMLPlugin({
            template: joinPath(dir, "src", "index.html"),
            filename: "index.html",
        }),
    ],
};
