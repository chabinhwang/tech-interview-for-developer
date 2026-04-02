import { defineConfig } from 'vitepress'
import { buildSourceExcludes } from '../scripts/vitepress-page-files.mjs'
import { buildVitePressContentMap } from '../scripts/vitepress-content-map.mjs'

const { nav, sidebar } = buildVitePressContentMap()

export default defineConfig({
  title: 'tech-interview-for-developer',
  description: '신입 개발자 전공 지식 & 기술 면접 백과사전',
  lang: 'ko-KR',
  cleanUrls: true,
  srcExclude: buildSourceExcludes(),
  ignoreDeadLinks: true,
  lastUpdated: true,
  markdown: {
    attrs: {
      disable: true
    }
  },
  vite: {
    assetsInclude: ['**/*.PNG', '**/*.JPG', '**/*.pptx']
  },
  themeConfig: {
    nav,
    sidebar,
    search: {
      provider: 'local'
    },
    outline: 'deep'
  }
})
