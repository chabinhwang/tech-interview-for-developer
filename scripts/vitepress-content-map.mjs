import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getVitePressSourcePath, isGeneratedAliasPath } from './vitepress-page-files.mjs'

const currentFile = fileURLToPath(import.meta.url)
const repoRoot = path.resolve(path.dirname(currentFile), '..')

const NAV_SECTIONS = [
  {
    text: 'Computer Science',
    dir: 'Computer Science',
    prefixes: ['Computer Science'],
    activeMatch: '^/Computer%20Science/'
  },
  {
    text: 'Web',
    dir: 'Web',
    prefixes: ['Web'],
    activeMatch: '^/Web/'
  },
  {
    text: 'Algorithm',
    dir: 'Algorithm',
    prefixes: ['Algorithm'],
    activeMatch: '^/Algorithm/'
  },
  {
    text: 'Language',
    dir: 'Language',
    prefixes: ['Language'],
    activeMatch: '^/Language/'
  },
  {
    text: 'Design Pattern',
    dir: 'Design Pattern',
    prefixes: ['Design Pattern'],
    activeMatch: '^/Design%20Pattern/'
  },
  {
    text: 'ETC',
    dir: 'ETC',
    prefixes: ['ETC', 'Interview', 'Linux', 'New Technology', 'Seminar'],
    activeMatch: '^/(ETC|Interview|Linux|New%20Technology|Seminar)/'
  }
]

const COMPUTER_SCIENCE_DIRS = [
  ['Computer Architecture', 'Computer Science/Computer Architecture'],
  ['Data Structure', 'Computer Science/Data Structure'],
  ['Database', 'Computer Science/Database'],
  ['Network', 'Computer Science/Network'],
  ['Operating System', 'Computer Science/Operating System'],
  ['Software Engineering', 'Computer Science/Software Engineering']
]

const WEB_DIRS = [
  ['Spring', 'Web/Spring'],
  ['Vue', 'Web/Vue'],
  ['React', 'Web/React'],
  ['DevOps', 'Web/DevOps']
]

const TOP_LEVEL_ETC_DIRS = [
  ['Interview', 'Interview'],
  ['Linux', 'Linux'],
  ['New Technology', 'New Technology'],
  ['Seminar', 'Seminar']
]

const LANGUAGE_ORDER = ['C', 'C++', 'Java', 'JavaScript', 'Python', 'Other']

export function buildVitePressContentMap() {
  const nav = NAV_SECTIONS.map(({ text, dir, activeMatch }) => ({
    text,
    link: toRoute(`${dir}/index.md`),
    activeMatch
  }))

  const sidebar = {}

  for (const section of NAV_SECTIONS) {
    const items = buildSectionSidebar(section.text)

    for (const prefix of section.prefixes) {
      sidebar[encodeRoute(`/${prefix}/`)] = items
    }
  }

  return { nav, sidebar }
}

function buildSectionSidebar(sectionText) {
  switch (sectionText) {
    case 'Computer Science':
      return [
        buildDirectoryGroup('Computer Science', 'Computer Science', {
          includeOverview: true,
          includeDirectFiles: false,
          includeChildDirectories: false
        }),
        ...COMPUTER_SCIENCE_DIRS.map(([text, dir]) =>
          buildDirectoryGroup(dir, text, {
            includeOverview: true,
            includeDirectFiles: true,
            includeChildDirectories: false
          })
        )
      ]
    case 'Web':
      return [
        buildDirectoryGroup('Web', 'Web', {
          includeOverview: true,
          includeDirectFiles: true,
          includeChildDirectories: false
        }),
        ...WEB_DIRS.map(([text, dir]) =>
          buildDirectoryGroup(dir, text, {
            includeOverview: false,
            includeDirectFiles: true,
            includeChildDirectories: false
          })
        )
      ]
    case 'Algorithm':
      return [
        buildDirectoryGroup('Algorithm', 'Algorithm', {
          includeOverview: true,
          includeDirectFiles: true,
          includeChildDirectories: false
        }),
        buildDirectoryGroup('Algorithm/professional', 'Professional', {
          includeOverview: false,
          includeDirectFiles: true,
          includeChildDirectories: false
        })
      ]
    case 'Language':
      return buildLanguageSidebar()
    case 'Design Pattern':
      return [
        buildDirectoryGroup('Design Pattern', 'Design Pattern', {
          includeOverview: true,
          includeDirectFiles: true,
          includeChildDirectories: false
        })
      ]
    case 'ETC':
      return [
        buildDirectoryGroup('ETC', 'ETC', {
          includeOverview: true,
          includeDirectFiles: true,
          includeChildDirectories: false
        }),
        ...TOP_LEVEL_ETC_DIRS.map(([text, dir]) =>
          buildDirectoryGroup(dir, text, {
            includeOverview: true,
            includeDirectFiles: true,
            includeChildDirectories: true
          })
        )
      ]
    default:
      return []
  }
}

function buildLanguageSidebar() {
  const languageDir = path.join(repoRoot, 'Language')
  const files = listMarkdownFiles(languageDir)
  const groups = new Map(LANGUAGE_ORDER.map((label) => [label, []]))

  for (const file of files) {
    if (isOverviewFile(file)) {
      continue
    }

    if (isGeneratedAliasPath(path.join('Language', file))) {
      continue
    }

    groups.get(detectLanguageGroup(file)).push(file)
  }

  const items = [
    buildDirectoryGroup('Language', 'Language', {
      includeOverview: true,
      includeDirectFiles: false,
      includeChildDirectories: false
    })
  ]

  for (const label of LANGUAGE_ORDER) {
    const groupFiles = groups.get(label)

    if (!groupFiles || groupFiles.length === 0) {
      continue
    }

    items.push({
      text: label,
      collapsed: false,
      items: groupFiles
        .sort(compareAlpha)
        .map((file) => buildPageItem(path.join('Language', file)))
    })
  }

  return items
}

function buildDirectoryGroup(dirRelativePath, text, options) {
  const absoluteDirectory = path.join(repoRoot, dirRelativePath)

  if (!fs.existsSync(absoluteDirectory)) {
    return null
  }

  const items = []
  const overviewFile = findOverviewFile(absoluteDirectory)

  if (options.includeOverview && overviewFile) {
    items.push({
      text: 'Overview',
      link: toRoute(path.join(dirRelativePath, overviewFile))
    })
  }

  if (options.includeDirectFiles) {
    const files = listMarkdownFiles(absoluteDirectory)
      .filter((file) => !isOverviewFile(file))
      .filter((file) => !isGeneratedAliasPath(path.join(dirRelativePath, file)))
      .sort(compareAlpha)

    for (const file of files) {
      items.push(buildPageItem(path.join(dirRelativePath, file)))
    }
  }

  if (options.includeChildDirectories) {
    for (const childDirectory of listChildDirectories(absoluteDirectory)) {
      const childGroup = buildDirectoryGroup(
        path.join(dirRelativePath, childDirectory),
        childDirectory,
        {
          includeOverview: true,
          includeDirectFiles: true,
          includeChildDirectories: true
        }
      )

      if (childGroup && childGroup.items.length > 0) {
        items.push(childGroup)
      }
    }
  }

  return {
    text,
    collapsed: false,
    items
  }
}

function buildPageItem(relativePath) {
  return {
    text: path.basename(relativePath, '.md'),
    link: toRoute(relativePath)
  }
}

function findOverviewFile(absoluteDirectory) {
  for (const candidate of ['index.md', 'README.md']) {
    if (fs.existsSync(path.join(absoluteDirectory, candidate))) {
      return candidate
    }
  }

  return null
}

function listMarkdownFiles(absoluteDirectory) {
  return fs
    .readdirSync(absoluteDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
}

function listChildDirectories(absoluteDirectory) {
  return fs
    .readdirSync(absoluteDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && directoryHasMarkdown(path.join(absoluteDirectory, entry.name)))
    .map((entry) => entry.name)
    .sort(compareAlpha)
}

function directoryHasMarkdown(absoluteDirectory) {
  const stack = [absoluteDirectory]

  while (stack.length > 0) {
    const currentDirectory = stack.pop()
    const entries = fs.readdirSync(currentDirectory, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        return true
      }

      if (entry.isDirectory()) {
        stack.push(path.join(currentDirectory, entry.name))
      }
    }
  }

  return false
}

function detectLanguageGroup(fileName) {
  const match = fileName.match(/^\[([^\]]+)\]/)
  const token = match ? match[1].toLowerCase() : fileName.toLowerCase()

  if (token.includes('c++') || token.includes('cpp')) {
    return 'C++'
  }

  if (token === 'c') {
    return 'C'
  }

  if (token.includes('javascript') || token.includes('javasript')) {
    return 'JavaScript'
  }

  if (token.includes('java')) {
    return 'Java'
  }

  if (token.includes('python')) {
    return 'Python'
  }

  return 'Other'
}

function isOverviewFile(fileName) {
  return fileName === 'index.md' || fileName === 'README.md'
}

function compareAlpha(left, right) {
  return left.localeCompare(right, 'ko', { numeric: true, sensitivity: 'base' })
}

function toRoute(relativePath) {
  const normalized = getVitePressSourcePath(relativePath).split(path.sep).join('/')
  const withoutExtension = normalized.replace(/\.md$/, '')

  if (withoutExtension === 'index' || withoutExtension === 'README') {
    return '/'
  }

  if (withoutExtension.endsWith('/index') || withoutExtension.endsWith('/README')) {
    const directory = withoutExtension.replace(/\/(index|README)$/, '')
    return encodeRoute(`/${directory}/`)
  }

  return encodeRoute(`/${withoutExtension}`)
}

function encodeRoute(routePath) {
  if (routePath === '/') {
    return routePath
  }

  const trailingSlash = routePath.endsWith('/')
  const segments = routePath.split('/').filter(Boolean).map((segment) => encodeURIComponent(segment))
  let encoded = `/${segments.join('/')}`

  if (trailingSlash) {
    encoded += '/'
  }

  return encoded
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const { nav, sidebar } = buildVitePressContentMap()

  console.log(
    JSON.stringify(
      {
        nav,
        sidebar
      },
      null,
      2
    )
  )
}
