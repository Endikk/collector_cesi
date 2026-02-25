import { HomePage } from "@/app/_components/HomePage";

export const revalidate = 0; // Dynamic for search

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  return <HomePage searchParams={resolvedSearchParams} />;
}
