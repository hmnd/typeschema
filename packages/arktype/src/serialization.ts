import type {AdapterResolver} from './resolver';
import type {SerializationAdapter} from '@typeschema/core';

export const serializationAdapter: SerializationAdapter<
  AdapterResolver
> = async schema => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return schema.toJsonSchema() as Promise<any>;
};
