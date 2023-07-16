const { resolve } = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

module.exports = {
    context: resolve("miniprogram"),
    entry: {
        app: "./app.ts",
        "pages/main/main": "./pages/main/main.ts",
        "pages/rsvp/rsvp": "./pages/rsvp/rsvp.ts",
        "pages/hunt/hunt": "./pages/hunt/hunt.ts",
        "pages/hunt/question_task": "./pages/hunt/question_task.ts",
        "pages/hunt/photo_task": "./pages/hunt/photo_task.ts",
        "pages/hunt/video_ad": "./pages/hunt/video_ad.ts",
    },
    output: {
        path: resolve("miniprogram_dist"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /(node_modules)|(third_party)/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanStaleWebpackAssets: false,
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "**/*",
                    to: "./",
                    globOptions: {
                        ignore: ["**/*.js", "**/*.ts"],
                    },
                },
                {
                    from: "third_party/**/*",
                    to: "./",
                },
            ]}),
    ],
    mode: "none",
}
