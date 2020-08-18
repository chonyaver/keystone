const globby = require('globby');
const path = require('path');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const { createItems } = require('@keystonejs/server-side-graphql-client');

const runTestModules = (testModules, runner, adapterName) => {
  testModules.map(require).forEach(mod => {
    const listKey = 'test';
    const keystoneTestWrapper = (testFn = () => {}) =>
      runner(
        () => {
          const createLists = keystone => {
            // Create a list with all the fields required for testing
            const fields = mod.getTestFields();

            keystone.createList(listKey, { fields });
          };
          return setupServer({ adapterName, createLists });
        },
        async ({ keystone, ...rest }) => {
          // Populate the database before running the tests
          await createItems({
            keystone,
            listKey,
            items: mod.initItems().map(x => ({ data: x })),
          });
          return testFn({ keystone, listKey, adapterName, ...rest });
        }
      );

    describe(`${mod.name} field`, () => {
      if (mod.crudTests) {
        describe(`CRUD operations`, () => {
          mod.crudTests(keystoneTestWrapper);
        });
      } else {
        test.todo('CRUD operations - tests missing');
      }

      if (mod.filterTests) {
        describe(`Filtering`, () => {
          mod.filterTests(keystoneTestWrapper);
        });
      } else {
        test.todo('Filtering - tests missing');
      }
    });
  });
};

describe('Fields', () => {
  const testModules = globby.sync(
    [`packages/**/src/**/test-fixtures.js`, `!packages/fields-auto-increment/src/test-fixtures.js`],
    {
      absolute: true,
    }
  );
  testModules.push(path.resolve('packages/fields/tests/test-fixtures.js'));

  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`${adapterName} adapter`, () => {
      runTestModules(testModules, runner, adapterName);
    })
  );
});

// Some fields types are not supported by all adapters.
// For example, 'AutoIncrement' is not supported by 'mongoose'.
// Thus, we need to filter those modules out, and run them individually by specifying the supported adapter.
describe('Fields: Adapter specific', () => {
  const testModules = globby.sync(`packages/fields-auto-increment/src/test-fixtures.js`, {
    absolute: true,
  });

  // Filtering out mongoose
  multiAdapterRunners()
    .filter(({ adapterName }) => adapterName !== 'mongoose')
    .map(({ runner, adapterName }) =>
      describe(`${adapterName} adapter`, () => {
        runTestModules(testModules, runner, adapterName);
      })
    );
});
