import { ResourceKey } from "../resources/constants";
import { PermissionKey } from "./constants";

type ResourceOf<K extends string> = K extends `${infer R}.${string}` ? R : never;

/**
 * The resource a permission belongs to ("tools.delete.any" → ResourceKey.Tools).
 * Type-checked: if a PermissionKey starts with something that isn't a
 * ResourceKey, this file stops compiling.
 */
export function permissionResource(key: PermissionKey): ResourceKey {
  const resource: `${ResourceKey}` = key.split(".")[0] as ResourceOf<`${PermissionKey}`>;
  return resource as ResourceKey;
}
