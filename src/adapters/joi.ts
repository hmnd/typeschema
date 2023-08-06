import type {Resolver} from '../resolver';
import type {Adapter} from '.';
import type {AnySchema} from 'joi';

import {isJSONSchema, isTypeBoxSchema, maybe} from '../utils';
import {ValidationIssue} from '../validation';

interface JoiResolver extends Resolver {
  base: AnySchema<this['type']>;
  module: typeof import('joi');
}

declare global {
  export interface TypeSchemaRegistry {
    joi: JoiResolver;
  }
}

export const init: Adapter<'joi'>['init'] = async () =>
  maybe(() => import('joi'));

export const guard: Adapter<'joi'>['guard'] = schema =>
  '_flags' in schema && !isTypeBoxSchema(schema) && !isJSONSchema(schema)
    ? schema
    : undefined;

export const validate: Adapter<'joi'>['validate'] = schema => async data => {
  const result = schema.validate(data);
  if (result.error == null) {
    return {data: result.value};
  }
  return {
    issues: result.error.details.map(
      ({message, path}) => new ValidationIssue(message, path),
    ),
  };
};
