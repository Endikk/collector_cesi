import { register } from '@/lib/metrics';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const metrics = await register.metrics();
        return new NextResponse(metrics, {
            status: 200,
            headers: {
                'Content-Type': register.contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
        });
    } catch (err) {
        console.error('Error generating metrics:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
