import {initTRPC} from '@trpc/server';
import {z} from 'zod';

import {wrap} from '..';

const schema = z.object({name: z.string()});

const t = initTRPC.create();
const appRouter = t.router({
  hello: t.procedure
    .input(wrap(schema))
    .query(({input}) => `Hello, ${input.name}!`),
  //         ^? {name: string}
});
