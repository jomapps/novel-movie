import { withSentryConfig } from '@sentry/nextjs'
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Handle BAML native modules
    webpackConfig.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    })

    // Handle BAML native modules - ignore missing optional dependencies
    webpackConfig.ignoreWarnings = [
      ...(webpackConfig.ignoreWarnings || []),
      /Module not found.*@boundaryml\/baml-/,
      /Module not found.*baml\..+\.node/,
    ]

    // Externalize BAML native modules for server-side
    if (webpackConfig.isServer) {
      // Make BAML native bindings external to prevent bundling issues
      webpackConfig.externals = webpackConfig.externals || []
      if (Array.isArray(webpackConfig.externals)) {
        webpackConfig.externals.push(
          '@boundaryml/baml-win32-x64-msvc',
          '@boundaryml/baml-win32-ia32-msvc',
          '@boundaryml/baml-win32-arm64-msvc',
          '@boundaryml/baml-darwin-x64',
          '@boundaryml/baml-darwin-arm64',
          '@boundaryml/baml-darwin-universal',
          '@boundaryml/baml-linux-x64-gnu',
          '@boundaryml/baml-linux-x64-musl',
          '@boundaryml/baml-linux-arm64-gnu',
          '@boundaryml/baml-linux-arm64-musl',
          '@boundaryml/baml-linux-arm-gnueabihf',
          '@boundaryml/baml-linux-arm-musleabihf',
          '@boundaryml/baml-freebsd-x64',
          '@boundaryml/baml-freebsd-arm64',
          '@boundaryml/baml-android-arm64',
          '@boundaryml/baml-android-arm-eabi',
        )
      }
    } else {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }

    return webpackConfig
  },
}

export default withSentryConfig(withPayload(nextConfig, { devBundleServerPackages: false }), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'jom-apps-services',

  project: 'javascript-nextjs',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
