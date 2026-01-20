import { vi } from 'vitest'

// Mock IntersectionObserver
class IntersectionObserverMock {
    constructor() { }
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock ResizeObserver
class ResizeObserverMock {
    constructor() { }
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock);
