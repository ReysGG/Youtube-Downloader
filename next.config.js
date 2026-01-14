/** @type {import('next').NextConfig} */
const nextConfig = {
    api: {
        responseLimit: false,
        bodyParser: {
            sizeLimit: '500mb',
        },
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '500mb',
        },
    },
}

module.exports = nextConfig
