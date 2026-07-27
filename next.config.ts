import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ??
  "bunexa-open-banking-prototype";
const basePath = isGitHubPages ? `/${repositoryName}` : "";

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: "export",
      trailingSlash: true,
      basePath,
      assetPrefix: basePath,
      images: {
        unoptimized: true,
      },
      typescript: {
        tsconfigPath: "tsconfig.pages.json",
      },
    }
  : {};

export default nextConfig;
