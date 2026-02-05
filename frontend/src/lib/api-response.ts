
export function sendResponse<T>(status: number, data: T | null = null, message: string = '') {
    return Response.json({ status, data, message }, { status });
}
