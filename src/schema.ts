import { readFileSync } from "node:fs";
import path from "node:path";

import { Ajv2020, type AnySchema } from "ajv/dist/2020.js";
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
  return compile(relativePath);
}

/**
 * Compiles one `$defs` entry of a schema, so a file whose kind is already known is checked against
 * that kind alone. The edition schema is a `oneOf` over four snapshot kinds: validating a region
 * file against the whole union reports what is wrong with all four branches, which buries the one
 * error that matters. The file's own location says which kind it must be, so the caller can ask for
 * it by name and get errors about that shape only.
 */
export function compileDefinition<T>(relativePath: string, definition: string): SchemaValidator<T> {
  return compile(relativePath, definition);
}

function compile<T>(relativePath: string, definition?: string): SchemaValidator<T> {
  const key = definition ? `${relativePath}#${definition}` : relativePath;
  const cached = compiled.get(key);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the cache is keyed by schema path and definition, so the entry was compiled for this T
  if (cached) return cached as SchemaValidator<T>;

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- ajv-formats ships CommonJS
  (addFormatsModule as unknown as { default: (instance: Ajv2020) => void }).default(ajv);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- schema files are repository content, not external input
  const schema = JSON.parse(readFileSync(path.join(ROOT, relativePath), "utf8")) as AnySchema;
  ajv.addSchema(schema);
  const schemaId = typeof schema === "object" && "$id" in schema && typeof schema.$id === "string" ? schema.$id : undefined;
  if (definition && !schemaId) throw new Error(`${relativePath} has no $id, so its definitions cannot be referenced`);

  const validate = definition ? ajv.getSchema<T>(`${schemaId}#/$defs/${definition}`) : ajv.getSchema<T>(schemaId ?? "");
  if (!validate) throw new Error(`${relativePath} has no definition "${definition ?? "(root)"}"`);

  const validator: SchemaValidator<T> = {
    errors: (data) =>
      validate(data) ? [] : (validate.errors ?? []).map((error) => `schema: ${error.instancePath || "/"} ${error.message}`),
    accepts: (data): data is T => validate(data),
  };
  compiled.set(key, validator);
  return validator;
}
