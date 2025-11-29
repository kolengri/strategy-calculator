export type ArrayKeys<T> = {
    [K in keyof T]: T[K] extends readonly unknown[] ? K : never;
}[keyof T];
