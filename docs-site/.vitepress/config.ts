import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'WebMCP',
  description: 'Open-source TypeScript SDK for Web AI Agent Communication via Model Context Protocol',
  base: '/agent-WebMCP/',

  head: [
    ['meta', { name: 'theme-color', content: '#10b981' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'WebMCP — Web AI Agent SDK' }],
    ['meta', { name: 'og:description', content: 'Empowering Web AI Agents to seamlessly interact with browser content and local network resources.' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'WebMCP',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Adapters', link: '/adapters/' },
      { text: 'API', link: '/api/' },
      { text: 'Demo', link: '/demo/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/core-concepts' },
          ],
        },
        {
          text: 'Usage',
          items: [
            { text: 'Examples', link: '/guide/examples' },
          ],
        },
      ],
      '/adapters/': [
        {
          text: 'Framework Adapters',
          items: [
            { text: 'Overview', link: '/adapters/' },
            { text: 'Express.js', link: '/adapters/express' },
            { text: 'Hono', link: '/adapters/hono' },
            { text: 'NestJS', link: '/adapters/nest' },
            { text: 'Vercel AI SDK', link: '/adapters/vercel-ai' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
          ],
        },
      ],
      '/demo/': [
        {
          text: 'Interactive Demo',
          items: [
            { text: 'Playground', link: '/demo/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zhenximi/agent-WebMCP' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@thestudioxi/webmcp' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 WebMCP Contributors',
    },

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/zhenximi/agent-WebMCP/edit/main/docs-site/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
