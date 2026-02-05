const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^jose': require.resolve('jest-mock'), // Mock jose
        '^openid-client': require.resolve('jest-mock'), // Mock openid-client
        '^@/components/ui/blur-fade': '<rootDir>/src/__mocks__/dummyComponent.js', // Mock missing component
    },
    transformIgnorePatterns: [],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
