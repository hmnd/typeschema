import type {Infer, InferIn} from '../index.ts';

import {beforeEach, describe, expect, jest, test} from 'node:@jest/globals';
import {expectTypeOf} from 'npm:expect-type@0.16.0';

import {assert, createAssert, validate} from '../index.ts';
import {fetchModule} from '../adapters/ajv.ts';
import {extractIssues} from './utils.ts';

describe('ajv', () => {
  const schema = {
    additionalProperties: false,
    properties: {
      age: {type: 'integer'},
      createdAt: {type: 'string'},
      email: {type: 'string'},
      id: {type: 'string'},
      name: {type: 'string'},
      updatedAt: {type: 'string'},
    },
    required: ['age', 'createdAt', 'email', 'id', 'name', 'updatedAt'],
    type: 'object',
  };
  const module = '../adapters/modules/ajv';

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

  beforeEach(() => fetchModule.clear());

  test('infer', () => {
    expectTypeOf<Infer<typeof schema>>().toEqualTypeOf<unknown>();
    expectTypeOf<InferIn<typeof schema>>().toEqualTypeOf<unknown>();
  });

  test('validate', async () => {
    expect(await validate(schema, data)).toStrictEqual({data});
    expect(extractIssues(await validate(schema, badData))).toStrictEqual([
      {
        message: 'must be integer',
        path: ['#/properties/age/type'],
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

  test('peer dependency', async () => {
    jest.mock(module, () => {
      throw new Error('Cannot find module');
    });
    await expect(validate(schema, data)).rejects.toThrow();
    await expect(assert(schema, data)).rejects.toThrow();
    jest.unmock(module);
  });
});
