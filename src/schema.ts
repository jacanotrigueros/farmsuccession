import { readFileSync } from "node:fs";
import path from "node:path";

import { Ajv2020, type AnySchema, type ValidateFunction } from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";

import { ROOT } from "./paths.ts";

/**
 * A compiled JSON Schema. `errors` lists readable problems and is empty when the data is valid;
 * `accepts` is the same check as a type guard, so validated data is typed without a cast.
 */
export type SchemaValidator<T> = {
  errors: (data: unknown) => string[];
  accepts: (data: unknown) => data is T;
};

const compiled = new Map<string, SchemaValidator<unknown>>();

/**
 * Compiles one schema from `schema/`, once per process.
 *
 * AJV runs in full strict mode, including `strictRequired`: the schemas declare every property a
 * conditional branch requires, so nothing has to be switched off to make them compile. A schema
 * that needs a relaxed AJV is a schema to fix, not a flag to add.
 */
export function compileSchema<T>(relativePath: string): SchemaValidator<T> {
  const cached = compiled.get(relativePath);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the cache is keyed by schema path, so the entry was compiled for this T
  if (cached) return cached as SchemaValidator<T>;

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- ajv-formats ships CommonJS
  (addFormatsModule as unknown as { default: (instance: Ajv2020) => void }).default(ajv);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- schema files are repository content, not external input
  const schema = JSON.parse(readFileSync(path.join(ROOT, relativePath), "utf8")) as AnySchema;
  const validate: ValidateFunction<T> = ajv.compile<T>(schema);

  const validator: SchemaValidator<T> = {
    errors: (data) =>
      validate(data) ? [] : (validate.errors ?? []).map((error) => `schema: ${error.instancePath || "/"} ${error.message}`),
    accepts: (data): data is T => validate(data),
  };
  compiled.set(relativePath, validator);
  return validator;
}
