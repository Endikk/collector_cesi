import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import Home from "../page";

// Mock the Prisma client to avoid DB connection in tests
vi.mock("@/lib/prisma", () => ({
    prisma: {
        item: {
            findMany: vi.fn().mockResolvedValue([
                {
                    id: "1",
                    title: "Test Item 1",
                    description: "Description 1",
                    price: 100,
                    imageUrl: "http://example.com/img1.jpg",
                    owner: { name: "Seller 1" },
                    createdAt: new Date(),
                },
                {
                    id: "2",
                    title: "Test Item 2",
                    description: "Description 2",
                    price: 200,
                    imageUrl: null, // Test fallback image
                    owner: { name: "Seller 2" },
                    createdAt: new Date(),
                },
            ]),
        },
    },
}));

// Mock the Magic UI components (BlurFade, BorderBeam) to avoid animation issues in basic JSDOM tests
vi.mock("@/components/magicui/blur-fade", () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/magicui/border-beam", () => ({
    BorderBeam: () => <div data-testid="border-beam" />,
}));

test("La page d'accueil affiche les objets correctement", async () => {
    const jsx = await Home();
    render(jsx);

    // Check if main title exists
    expect(screen.getByText(/Objets rares/i)).toBeDefined();

    // Check if items are rendered
    expect(screen.getByText("Test Item 1")).toBeDefined();
    expect(screen.getByText("Test Item 2")).toBeDefined();

    // Check pricing formatting
    expect(screen.getByText(/100,00/)).toBeDefined();

    // Check if Seller info is displayed
    expect(screen.getByText("Seller 1")).toBeDefined();
});
