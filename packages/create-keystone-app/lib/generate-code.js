const { getProjectName } = require('./get-project-name');
const { getAdapterConfig } = require('./get-adapter-config');

const generateCode = async () => {
  const projectName = await getProjectName();
  const adapterConfig = `{ url: '${await getAdapterConfig()}' }`;

  return `${adapterRequire}
const PROJECT_NAME = '${projectName}';
const adapterConfig = ${adapterConfig};
`;
};

module.exports = { generateCode };
