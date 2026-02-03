const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'example',
  serviceId: 'server',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

function seedMovies(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('SeedMovies', undefined, inputOpts);
}
exports.seedMovies = seedMovies;

function listPublicMovieLists(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPublicMovieLists', undefined, inputOpts);
}
exports.listPublicMovieLists = listPublicMovieLists;

function createMovieList(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateMovieList', inputVars, inputOpts);
}
exports.createMovieList = createMovieList;

function getMyMovieLists(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetMyMovieLists', undefined, inputOpts);
}
exports.getMyMovieLists = getMyMovieLists;

