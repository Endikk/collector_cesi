import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NavBar from '../NavBar'

// Mock next-auth
vi.mock("next-auth/react", () => ({
    useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
    signOut: vi.fn(),
}));

describe('NavBar', () => {
    it('affiche le bouton de connexion si non authentifié', () => {
        render(<NavBar />)
        expect(screen.getByText('Connexion')).toBeDefined()
    })
})
