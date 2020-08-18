import { createItem, getItem, getItems, updateItem } from '@keystonejs/server-side-graphql-client';
import { Text } from '@keystonejs/fields';
import { AutoIncrement } from './index';

export const name = 'AutoIncrement';
export { AutoIncrement as type };
export const exampleValue = '1';
export const exampleValue2 = '2';
export const supportsUnique = true;

//NOTE: The AutoIncrement field type behaves in a way that isn't supported by
// our current uniqueness tests.

export const getTestFields = () => {
  return {
    name: { type: Text },
    orderNumber: { type: AutoIncrement, gqlType: 'Int' },
  };
};

export const initItems = () => {
  return [
    { name: 'product1' },
    { name: 'product2' },
    { name: 'product3' },
    { name: 'product4' },
    { name: 'product5' },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected) =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name orderNumber',
        sortBy: 'name_ASC',
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
      ])
    )
  );

  test(
    'Filter: orderNumber',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber: 1 }, [{ name: 'product1', orderNumber: 1 }])
    )
  );

  test(
    'Filter: orderNumber_not',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not: 1 }, [
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
      ])
    )
  );

  test(
    'Filter: orderNumber_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not: null }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
      ])
    )
  );

  test(
    'Filter: orderNumber_lt',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_lt: 2 }, [{ name: 'product1', orderNumber: 1 }])
    )
  );

  test(
    'Filter: orderNumber_lte',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_lte: 2 }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
      ])
    )
  );

  test(
    'Filter: orderNumber_gt',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_gt: 2 }, [
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
      ])
    )
  );

  test(
    'Filter: orderNumber_gte',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_gte: 2 }, [
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
      ])
    )
  );

  test(
    'Filter: orderNumber_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_in: [] }, []))
  );

  test(
    'Filter: orderNumber_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not_in: [] }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
      ])
    )
  );

  test(
    'Filter: orderNumber_in',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_in: [1, 2, 3] }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
      ])
    )
  );

  test(
    'Filter: orderNumber_not_in',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not_in: [1, 2, 3] }, [
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
      ])
    )
  );

  test(
    'Filter: orderNumber_in null',
    withKeystone(({ keystone }) => match(keystone, { orderNumber_in: [null] }, []))
  );

  test(
    'Filter: orderNumber_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { orderNumber_not_in: [null] }, [
        { name: 'product1', orderNumber: 1 },
        { name: 'product2', orderNumber: 2 },
        { name: 'product3', orderNumber: 3 },
        { name: 'product4', orderNumber: 4 },
        { name: 'product5', orderNumber: 5 },
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
        returnFields: 'id orderNumber',
      });
      return wrappedFn({ keystone, listKey, items });
    };
  };

  test(
    'Create',
    withKeystone(
      withHelpers(async ({ keystone, listKey }) => {
        try {
          await createItem({
            keystone,
            listKey,
            // Create access is false for `orderNumber`
            item: { name: 'Test product', orderNumber: 1 },
            returnFields: 'orderNumber',
          });
          expect(true).toEqual(false);
        } catch (error) {
          expect(error).not.toBe(undefined);
        }
      })
    )
  );

  test(
    'Read',
    withKeystone(
      withHelpers(async ({ keystone, listKey, items }) => {
        const data = await getItem({
          keystone,
          listKey,
          itemId: items[0].id,
          returnFields: 'orderNumber',
        });
        expect(data).not.toBe(null);
        expect(data.orderNumber).toBe(items[0].orderNumber);
      })
    )
  );

  describe('Update', () => {
    test(
      'Updating the value',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          try {
            await updateItem({
              keystone,
              listKey,
              item: {
                id: items[0].id,
                data: { orderNumber: 3 },
              },
              returnFields: 'orderNumber',
            });

            expect(true).toEqual(false);
          } catch (error) {
            expect(error).not.toBe(undefined);
          }
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
              data: { name: 'product' },
            },
            returnFields: 'name orderNumber',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('product');
          expect(data.orderNumber).toBe(items[0].orderNumber);
        })
      )
    );
  });
};
