import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import pugPlugin from "@11ty/eleventy-plugin-pug";
import glsl from "vite-plugin-glsl";
import dotenv from "dotenv";

dotenv.config();

export default function (eleventyConfig) {
  eleventyConfig.setServerOptions({
    showAllHosts: true,
  });

  eleventyConfig.addPlugin(EleventyVitePlugin, {
    tempFolderName: ".11ty-vite",

    viteOptions: {
      publicDir: "src/assets",
      root: "src",

      plugins: [glsl()],

      resolve: {
        alias: {
          "@styles": "/src/styles",
          "@app": "/src/app",
          "@utils": "/src/app/utils",
          "@components": "/src/app/components",
          "@shaders": "/src/app/shaders",
          "@classes": "/src/app/classes",
          "@animations": "/src/app/animations",
          "@pages": "/src/app/pages",
          "@canvas": "/src/app/components/Canvas",
        },
      },
    },
  });
  eleventyConfig.addPlugin(pugPlugin, {
    debug: true,
  });

  eleventyConfig.addPassthroughCopy("public");
  eleventyConfig.addPassthroughCopy("src/app");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("albums.json");
  eleventyConfig.setServerPassthroughCopyBehavior("copy");

  return {
    dir: {
      input: "src/views",
      output: "_site",
      includes: "_includes",
      data: "_data",
      layouts: "_layouts",
    },
  };
}
