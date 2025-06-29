export type Task = {
    title: string;
    description?: string;
    status: 'pending' | 'completed';
};