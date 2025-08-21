// Helps with successResponse(data) vs raw data shapes
interface SuccessResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}

export function unwrap<T = any>(payload: SuccessResponse<T> | T | null | undefined): T | {} {
    if (!payload) return {};
    // typical successResponse shape: { success, message, data: { ... } }
    if (
        typeof payload === 'object' &&
        payload !== null &&
        'data' in payload &&
        typeof (payload as SuccessResponse<T>).data === 'object'
    ) {
        return (payload as SuccessResponse<T>).data;
    }
    return payload as T;
}