import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/app/starter-packs",
        destination: "/app/quick-lists",
        permanent: true,
      },
      {
        source: "/app/starter-packs/:slug",
        destination: "/app/quick-lists/:slug",
        permanent: true,
      },
      {
        source: "/app/session/:token/receipt",
        destination: "/app/session/:token",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
