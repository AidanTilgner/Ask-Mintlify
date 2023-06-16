import * as esbuild from "esbuild";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin";
import { config } from "dotenv";
import http from "http";

config();

const watch = async () => {
    const ctx = await esbuild.context({
        entryPoints: ["client/index.tsx"],
        bundle: true,
        outfile: "public/build/bundle.js",
        sourcemap: true,
        minify: false,
        plugins: [
            sassPlugin({
                filter: /\.module\.scss$/,
                transform: postcssModules({
                    generateScopedName: "[name]__[local]___[hash:base64:5]",
                    basedir: "client",
                }),
                type: "css",
            }),
            sassPlugin({
                filter: /\.scss$/,
            }),
            {
                name: "development-server",
                setup: (build) => {
                    build.onEnd(() => {
                        const now = new Date().toLocaleTimeString();
                        console.info(`Build finished at ${now}. Watching for changes...`);
                        console.info("Sending rebuild notification...");
                        const req = http.request(
                            {
                                host: "localhost",
                                port: process.env.PORT,
                                path: "/esbuild-rebuilt",
                                method: "POST",
                            },
                            (res) => {
                                if (res.complete) {
                                    console.info("Rebuild notification sent successfully.");
                                } else {
                                    console.error("Error sending rebuild notification:", res);
                                }
                            }
                        );
                        req.on("error", (err) => {
                            console.error("Error sending rebuild notification:", err);
                        });
                        req.end();
                    });
                },
            },
        ],
        loader: {
            ".js": "jsx",
            ".jsx": "jsx",
            ".ts": "tsx",
            ".tsx": "tsx",
            ".scss": "css",
        },
        jsxFactory: "React.createElement",
        jsxFragment: "React.Fragment",
    });
    await ctx.watch();
    console.info("Served and Watching...");
};
watch();
