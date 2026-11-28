/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_webhooks from "../lib/webhooks.js";
import type * as permissions_constants from "../permissions/constants.js";
import type * as permissions_helpers from "../permissions/helpers.js";
import type * as permissions_seed from "../permissions/seed.js";
import type * as permissions_validators from "../permissions/validators.js";
import type * as resources_constants from "../resources/constants.js";
import type * as resources_seed from "../resources/seed.js";
import type * as resources_validators from "../resources/validators.js";
import type * as rolePermissions_seed from "../rolePermissions/seed.js";
import type * as rolePermissions_validators from "../rolePermissions/validators.js";
import type * as roles_constants from "../roles/constants.js";
import type * as roles_helpers from "../roles/helpers.js";
import type * as roles_seed from "../roles/seed.js";
import type * as roles_validators from "../roles/validators.js";
import type * as seed from "../seed.js";
import type * as users_constants from "../users/constants.js";
import type * as users_helpers from "../users/helpers.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_validators from "../users/validators.js";
import type * as users_webhook from "../users/webhook.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  http: typeof http;
  "lib/email": typeof lib_email;
  "lib/errors": typeof lib_errors;
  "lib/webhooks": typeof lib_webhooks;
  "permissions/constants": typeof permissions_constants;
  "permissions/helpers": typeof permissions_helpers;
  "permissions/seed": typeof permissions_seed;
  "permissions/validators": typeof permissions_validators;
  "resources/constants": typeof resources_constants;
  "resources/seed": typeof resources_seed;
  "resources/validators": typeof resources_validators;
  "rolePermissions/seed": typeof rolePermissions_seed;
  "rolePermissions/validators": typeof rolePermissions_validators;
  "roles/constants": typeof roles_constants;
  "roles/helpers": typeof roles_helpers;
  "roles/seed": typeof roles_seed;
  "roles/validators": typeof roles_validators;
  seed: typeof seed;
  "users/constants": typeof users_constants;
  "users/helpers": typeof users_helpers;
  "users/mutations": typeof users_mutations;
  "users/validators": typeof users_validators;
  "users/webhook": typeof users_webhook;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {};
