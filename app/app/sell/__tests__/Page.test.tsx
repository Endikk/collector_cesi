import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import SellPage from "../page";

// Mock NextAuth useSession hooks
vi.mock("next-auth/react", () => ({
    useSession: vi.fn(() => ({
        data: { user: { name: "Test User" } },
        status: "authenticated",
    })),
}));

// Mock useRouter
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
        refresh: vi.fn(),
    }),
}));

// Mock Magic UI
vi.mock("@/components/magicui/blur-fade", () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));


test("Sell Page renders form correctly", () => {
    render(<SellPage />);

    // Check for Title input
    expect(screen.getByLabelText(/Titre/i)).toBeDefined();

    // Check for Price input
    expect(screen.getByLabelText(/Prix/i)).toBeDefined();

    // Check for Description
    expect(screen.getByLabelText(/Description/i)).toBeDefined();

    // Check Submit button
    expect(screen.getByRole("button", { name: /Publier/i })).toBeDefined();
});

test("Sell Page handles input changes", () => {
    render(<SellPage />);

    const titleInput = screen.getByLabelText(/Titre/i) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "My New Item" } });
    expect(titleInput.value).toBe("My New Item");
});
