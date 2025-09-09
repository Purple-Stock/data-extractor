import '@testing-library/jest-dom'

// Mock window and document for DOM testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// Mock CSS.supports
Object.defineProperty(window, 'CSS', {
  value: {
    supports: jest.fn(() => false),
  },
})

// Mock document.documentElement for WebkitAnimation
Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      WebkitAnimation: '',
    },
  },
})

// Mock document.createElement to handle WebkitAnimation
const originalCreateElement = document.createElement
document.createElement = jest.fn((tagName) => {
  const element = originalCreateElement.call(document, tagName)
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: jest.fn(),
    }
  }
  return element
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock next/themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }) => children,
}))

// Mock xlsx
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}))

// Mock jszip
jest.mock('jszip', () => {
  return jest.fn().mockImplementation(() => ({
    file: jest.fn(),
    generateAsync: jest.fn().mockResolvedValue(new Blob()),
  }))
})

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()

// Mock document.createElement and related methods
const mockLink = {
  href: '',
  download: '',
  click: jest.fn(),
}

Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName) => {
    if (tagName === 'a') {
      return mockLink
    }
    return {}
  }),
})

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn(),
})

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn(),
})