import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'server',
  location: 'us-east4'
};

export const seedMoviesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SeedMovies');
}
seedMoviesRef.operationName = 'SeedMovies';

export function seedMovies(dc) {
  return executeMutation(seedMoviesRef(dc));
}

export const listPublicMovieListsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPublicMovieLists');
}
listPublicMovieListsRef.operationName = 'ListPublicMovieLists';

export function listPublicMovieLists(dc) {
  return executeQuery(listPublicMovieListsRef(dc));
}

export const createMovieListRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMovieList', inputVars);
}
createMovieListRef.operationName = 'CreateMovieList';

export function createMovieList(dcOrVars, vars) {
  return executeMutation(createMovieListRef(dcOrVars, vars));
}

export const getMyMovieListsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyMovieLists');
}
getMyMovieListsRef.operationName = 'GetMyMovieLists';

export function getMyMovieLists(dc) {
  return executeQuery(getMyMovieListsRef(dc));
}

