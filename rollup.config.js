import vue from "rollup-plugin-vue";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript";
import css from "rollup-plugin-css-only";
import child_process from "child_process";
import alias from "@rollup/plugin-alias";

const production = !process.env.ROLLUP_WATCH;

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = child_process.spawn(
                "npm",
                ["run", "start", "--", "--dev"],
                {
                    stdio: ["ignore", "inherit", "inherit"],
                    shell: true
                }
            );

            process.on("SIGTERM", toExit);
            process.on("exit", toExit);
        }
    };
}

export default {
    input: "src/main.ts",
    output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "public/index.js"
    },
    plugins: [
        alias({
            entries: {
                vue:
                    "./node_modules/vue/dist/vue.runtime.esm-browser" +
                    (production ? ".prod" : "") +
                    ".js"
            }
        }),
        vue({}),
        // we'll extract any component CSS out into
        // a separate file - better for performance
        css({ output: "index.css" }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ["vue"]
        }),

        commonjs(),

        typescript({
            sourceMap: !production,
            inlineSources: !production
        }),

        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload("public"),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser()
    ],
    watch: {
        clearScreen: true
    }
};
