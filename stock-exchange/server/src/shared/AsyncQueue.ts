export class AsyncQueue {
    private last: Promise<unknown> = Promise.resolve();

    push<T>(task: () => Promise<T>): Promise<T> {
        this.last = this.last.catch(() => {}).then(task);
        return this.last as Promise<T>;
    }
}
