export type PromiseResponseError<T = unknown> = {
    message: string;
    code?: string | number;
    details?: T;
    stack?: string;
};