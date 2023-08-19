import type {Resolver} from '../resolver.ts';
import type {Coerce, CreateValidate} from './index.ts';
import type {Any, OutputOf, Type, TypeOf} from 'npm:io-ts@2.2.20';

import {isJSONSchema, isTypeBoxSchema, memoize} from '../utils.ts';
import {ValidationIssue} from '../validation.ts';

export interface IoTsResolver extends Resolver {
  base: Type<this['type']>;
  input: this['schema'] extends Any ? OutputOf<this['schema']> : never;
  output: this['schema'] extends Any ? TypeOf<this['schema']> : never;
}

export const fetchModule = /* @__PURE__ */ memoize(
  () => import('./modules/io-ts.ts'),
);

const coerce: Coerce<'io-ts'> = /* @__NO_SIDE_EFFECTS__ */ fn => schema =>
  'encode' in schema && !isTypeBoxSchema(schema) && !isJSONSchema(schema)
    ? fn(schema)
    : undefined;

export const createValidate: CreateValidate = coerce(async schema => {
  const {isRight} = await fetchModule();
  return async (data: unknown) => {
    const result = schema.decode(data);
    if (isRight(result)) {
      return {data: result.right};
    }
    return {
      issues: result.left.map(
        ({message, context}) =>
          new ValidationIssue(
            message ?? '',
            context.map(({key}) => key),
          ),
      ),
    };
  };
});
