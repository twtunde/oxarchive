import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "60mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
        ],
    },
}

export default nextConfig
