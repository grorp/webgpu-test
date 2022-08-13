import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = dirname(fileURLToPath(import.meta.url));

import HTMLPlugin from "html-webpack-plugin";

export default {
    mode: "development",

    entry: join(dir, "src", "index.js"),
    output: {
        path: join(dir, "dist"),
        filename: "index.js",
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                loader: "html-loader",
            },
            {
                test: /\.wgsl$/,
                type: "asset/source",
            },
        ],
    },

    plugins: [
        new HTMLPlugin({
            template: join(dir, "src", "index.html"),
            filename: "index.html",
        }),
    ],

    experiments: {
        topLevelAwait: true,
    },
};
