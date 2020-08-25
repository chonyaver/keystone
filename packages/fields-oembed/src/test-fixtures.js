const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
import { createItem, getItem, getItems, updateItem } from '@keystonejs/server-side-graphql-client';

import { OEmbed, IframelyOEmbedAdapter } from './';

export const name = 'OEmbed';
export { OEmbed as type };
export const exampleValue = 'https://jestjs.io';
export const exampleValue2 = 'https://codesandbox.io';
export const supportsUnique = false;
export const skipRequiredTest = false;

const iframelyAdapter = new IframelyOEmbedAdapter({
  apiKey: process.env.IFRAMELY_API_KEY,
});

export const fieldConfig = { adapter: iframelyAdapter };

export const getTestFields = () => {
  return {
    name: { type: String },
    portfolio: { type: OEmbed, adapter: iframelyAdapter },
  };
};

export const initItems = () => {
  return [
    { name: 'a', portfolio: 'https://github.com' },
    { name: 'b', portfolio: 'https://keystonejs.com' },
    { name: 'c', portfolio: 'https://reactjs.org' },
    { name: 'd', portfolio: 'https://REACTJS.ORG' },
    { name: 'e', portfolio: null },
    { name: 'f' },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name portfolio { originalUrl }',
        sortBy,
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
        { name: 'e', portfolio: null },
        { name: 'f', portfolio: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
        { name: 'e', portfolio: null },
        { name: 'f', portfolio: null },
      ])
    )
  );

  test(
    'Filter: portfolio_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { portfolio_not: null }, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
      ])
    )
  );

  test(
    'Filter: portfolio_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { portfolio_not_in: [null] }, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
      ])
    )
  );

  test(
    'Filter: portfolio_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { portfolio_in: [] }, []))
  );

  test(
    'Filter: portfolio_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { portfolio_not_in: [] }, [
        { name: 'a', portfolio: { originalUrl: 'https://github.com' } },
        {
          name: 'b',
          portfolio: { originalUrl: 'https://keystonejs.com' },
        },
        { name: 'c', portfolio: { originalUrl: 'https://reactjs.org' } },
        { name: 'd', portfolio: { originalUrl: 'https://REACTJS.ORG' } },
        { name: 'e', portfolio: null },
        { name: 'f', portfolio: null },
      ])
    )
  );
};

export const crudTests = withKeystone => {
  const withHelpers = wrappedFn => {
    return async ({ keystone, listKey }) => {
      const items = await getItems({
        keystone,
        listKey,
        returnFields: 'id portfolio { originalUrl }',
        sortBy: 'name_ASC',
      });
      return wrappedFn({ keystone, listKey, items });
    };
  };

  describe('Create', () => {
    test(
      'Creating the value',
      withKeystone(
        withHelpers(async ({ keystone, listKey }) => {
          const data = await createItem({
            keystone,
            listKey,
            item: { name: 'Aman blog', portfolio: 'https://amanexplains.com' },
            returnFields: 'portfolio { originalUrl }',
          });
          expect(data).not.toBe(null);
          expect(data.portfolio.originalUrl).toBe('https://amanexplains.com');
        })
      )
    );
    test(
      `Should throw error when url doesn't start with https:// or https://`,
      withKeystone(
        withHelpers(async ({ keystone, listKey }) => {
          try {
            await createItem({
              keystone,
              listKey,
              item: { name: 'medium', portfolio: 'medium.com' },
              returnFields: 'portfolio { originalUrl }',
            });
            expect(true).toEqual(false);
          } catch (error) {
            expect(error).not.toBe(undefined);
            expect(error.message).toMatch(
              'url passed to IFramely OEmbed Adapter must start with either http:// or https://'
            );
          }
        })
      )
    );
  });

  test(
    'Read',
    withKeystone(
      withHelpers(async ({ keystone, listKey, items }) => {
        const data = await getItem({
          keystone,
          listKey,
          itemId: items[0].id,
          returnFields: 'portfolio { originalUrl }',
        });
        expect(data).not.toBe(null);
        expect(data.portfolio.originalUrl).toBe(items[0].portfolio.originalUrl);
      })
    )
  );

  describe('Update', () => {
    test(
      'Updating the value',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { portfolio: 'https://dev.to' },
            },
            returnFields: 'portfolio { originalUrl }',
          });
          expect(data).not.toBe(null);
          expect(data.portfolio.originalUrl).toBe('https://dev.to');
        })
      )
    );

    test(
      'Updating the value to null',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { portfolio: null },
            },
            returnFields: 'portfolio { originalUrl }',
          });
          expect(data).not.toBe(null);
          expect(data.portfolio).toBe(null);
        })
      )
    );

    test(
      'Updating without this field',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { name: 'Keystone User Guide' },
            },
            returnFields: 'name portfolio { originalUrl }',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('Keystone User Guide');
          expect(data.portfolio.originalUrl).toBe(items[0].portfolio.originalUrl);
        })
      )
    );
  });
};
