/**
 * Extracts all nested object keys (including nested ones separated by dots) that contain the specified type.
 *
 * This utility type recursively traverses an object structure and returns a union of all key paths
 * (using dot notation) where the value matches the `Needly` type.
 *
 * @template Obj - The source object type to extract keys from
 * @template Needly - The target type to search for in the object structure
 *
 * @example
 * ```typescript
 * type User = {
 *   id: number;
 *   name: string;
 *   profile: {
 *     bio: string;
 *     avatar: string;
 *     settings: {
 *       theme: string;
 *     };
 *   };
 *   tags: string[];
 * };
 *
 * type StringKeys = NestedTypeKeys<User, string>;
 * // Result: "name" | "profile.bio" | "profile.avatar" | "profile.settings.theme"
 *
 * type NumberKeys = NestedTypeKeys<User, number>;
 * // Result: "id"
 * ```
 *
 * @example
 * ```typescript
 * // Works with arrays - extracts keys from objects inside arrays
 * type Data = {
 *   users: { name: string; age: number }[];
 *   config: { theme: string };
 * };
 *
 * type StringKeys = NestedTypeKeys<Data, string>;
 * // Result: "users.name" | "config.theme"
 * ```
 */
export type NestedTypeKeys<Obj, Needly> = {
  [K in keyof Obj]: Obj[K] extends Needly
    ? K
    : Obj[K] extends readonly unknown[]
      ? Obj[K] extends readonly (infer Item)[]
        ? Item extends Record<string, unknown>
          ? `${K & string}.${NestedTypeKeys<Item, Needly>}`
          : never
        : never
      : Obj[K] extends Record<string, unknown>
        ? `${K & string}.${NestedTypeKeys<Obj[K], Needly>}`
        : never;
}[keyof Obj] extends infer U
  ? U extends never
    ? never
    : U extends `${string}.${string}`
      ? U
      : U extends string
        ? U
        : never
  : never;
