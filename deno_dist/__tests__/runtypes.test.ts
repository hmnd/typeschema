import type {Infer, InferIn} from '../index.ts';

import {describe, expect, test} from 'node:@jest/globals';
import {expectTypeOf} from 'npm:expect-type@0.16.0';
import {Number, Record, String} from 'npm:runtypes@6.7.0';

import {assert, createAssert, validate} from '../index.ts';
import {extractIssues} from './utils.ts';

describe('runtypes', () => {
  const schema = Record({
    age: Number,
    createdAt: String,
    email: String,
    id: String,
    name: String,
    updatedAt: String,
  });

  const data = {
    age: 123,
    createdAt: '2021-01-01T00:00:00.000Z',
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: '2021-01-01T00:00:00.000Z',
  };
  const badData = {
    age: '123',
    createdAt: '2021-01-01T00:00:00.000Z',
    email: 'john.doe@test.com',
    id: 'c4a760a8-dbcf-4e14-9f39-645a8e933d74',
    name: 'John Doe',
    updatedAt: '2021-01-01T00:00:00.000Z',
  };

  test('infer', () => {
    expectTypeOf<Infer<typeof schema>>().toEqualTypeOf(data);
    expectTypeOf<InferIn<typeof schema>>().toEqualTypeOf(data);
  });

  test('validate', async () => {
    expect(await validate(schema, data)).toStrictEqual({data});
    expect(extractIssues(await validate(schema, badData))).toStrictEqual([
      {
        message: `Validation failed:
{
  "age": "Expected number, but was string"
}.
Object should match { age: number; createdAt: string; email: string; id: string; name: string; updatedAt: string; }`,
      },
    ]);
  });

  test('assert', async () => {
    expect(await assert(schema, data)).toStrictEqual(data);
    await expect(assert(schema, badData)).rejects.toThrow();
  });

  test('createAssert', async () => {
    const assertSchema = createAssert(schema);
    expect(await assertSchema(data)).toEqual(data);
    await expect(assertSchema(badData)).rejects.toThrow();
  });
});
