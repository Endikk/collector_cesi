import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:4000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const response = await fetch(`${BACKEND_URL}/shops/${shopId}`);

    if (!response.ok) {
      throw new Error('Shop not found');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching shop:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shopId } = await params;

    const response = await fetch(`${BACKEND_URL}/shops/${shopId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.id}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update shop');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update shop' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shopId } = await params;

    const response = await fetch(`${BACKEND_URL}/shops/${shopId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.user.id}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete shop');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete shop' },
      { status: 500 }
    );
  }
}
