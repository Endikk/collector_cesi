import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:4000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/validation/rules`);

    if (!response.ok) {
      throw new Error('Failed to fetch validation rules');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching validation rules:', error);
    return NextResponse.json(
      {
        title: { minLength: 10, required: true },
        description: { minLength: 50, required: true },
        images: { minCount: 2, required: true, formats: ['jpg', 'jpeg', 'png', 'webp'] },
        price: { min: 0.5, max: 100000, required: true },
        shippingCost: { min: 0, max: 100 },
        categoryId: { required: true },
      },
      { status: 200 }
    );
  }
}
