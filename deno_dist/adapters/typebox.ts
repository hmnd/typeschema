import type {Resolver} from '../resolver.ts';
import type {Coerce, CreateValidate} from './index.ts';
import type {Static, TSchema} from 'npm:@sinclair/typebox@0.31.0';

import {isTypeBoxSchema, memoize} from '../utils.ts';
import {ValidationIssue} from '../validation.ts';

export interface TypeBoxResolver extends Resolver {
  base: TSchema;
  input: this['schema'] extends TSchema ? Static<this['schema']> : never;
  output: this['schema'] extends TSchema ? Static<this['schema']> : never;
}

export const fetchModule = /* @__PURE__ */ memoize(
  () => import('./modules/typebox.ts'),
);

const coerce: Coerce<'typebox'> = /* @__NO_SIDE_EFFECTS__ */ fn => schema =>
  isTypeBoxSchema(schema) ? fn(schema) : undefined;

export const createValidate: CreateValidate = coerce(async schema => {
  const {TypeCompiler} = await fetchModule();
  const result = TypeCompiler.Compile(schema);
  return async (data: unknown) => {
    if (result.Check(data)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {data: data as any};
    }
    return {
      issues: [...result.Errors(data)].map(
        ({message, path}) => new ValidationIssue(message, [path]),
      ),
    };
  };
});
