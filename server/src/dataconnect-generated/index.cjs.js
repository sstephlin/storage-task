const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'server',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const seedMoviesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedMovies');
}
seedMoviesRef.operationName = 'SeedMovies';
exports.seedMoviesRef = seedMoviesRef;

exports.seedMovies = function seedMovies(dc) {
  return executeMutation(seedMoviesRef(dc));
};

const listPublicMovieListsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPublicMovieLists');
}
listPublicMovieListsRef.operationName = 'ListPublicMovieLists';
exports.listPublicMovieListsRef = listPublicMovieListsRef;

exports.listPublicMovieLists = function listPublicMovieLists(dc) {
  return executeQuery(listPublicMovieListsRef(dc));
};

const createMovieListRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMovieList', inputVars);
}
createMovieListRef.operationName = 'CreateMovieList';
exports.createMovieListRef = createMovieListRef;

exports.createMovieList = function createMovieList(dcOrVars, vars) {
  return executeMutation(createMovieListRef(dcOrVars, vars));
};

const getMyMovieListsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyMovieLists');
}
getMyMovieListsRef.operationName = 'GetMyMovieLists';
exports.getMyMovieListsRef = getMyMovieListsRef;

exports.getMyMovieLists = function getMyMovieLists(dc) {
  return executeQuery(getMyMovieListsRef(dc));
};
