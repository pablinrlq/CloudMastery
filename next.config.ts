import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces the minimal self-hosted server used by the production Docker image.
  output: "standalone",
};

export default nextConfig;
