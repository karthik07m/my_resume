import type { NextConfig } from "next";

// GitHub Pages serves the site from https://karthik07m.github.io/my_resume/
const basePath = "/my_resume";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
  reactCompiler: true,
  turbopack: { root: process.cwd() },
};

export default nextConfig;
