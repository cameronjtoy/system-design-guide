import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { contentPlugin } from './scripts/vite-plugin-content.ts'

// Served from https://<user>.github.io/system-design-guide/
export default defineConfig({
  base: '/system-design-guide/',
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeHighlight, { plainText: ['mermaid', 'text'] }]],
      }),
    },
    react({ include: /\.(mdx|ts|tsx)$/ }),
    contentPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-dom/client', 'react-router'],
        },
      },
    },
  },
})
