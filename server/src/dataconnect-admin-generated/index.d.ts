import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface CreateMovieListData {
  movieList_insert: MovieList_Key;
}

export interface CreateMovieListVariables {
  name: string;
  description: string;
}

export interface GetMyMovieListsData {
  movieLists: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    isPublic: boolean;
  } & MovieList_Key)[];
}

export interface ListPublicMovieListsData {
  movieLists: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & MovieList_Key)[];
}

export interface MovieListEntry_Key {
  movieListId: UUIDString;
  movieId: UUIDString;
  __typename?: 'MovieListEntry_Key';
}

export interface MovieList_Key {
  id: UUIDString;
  __typename?: 'MovieList_Key';
}

export interface Movie_Key {
  id: UUIDString;
  __typename?: 'Movie_Key';
}

export interface Review_Key {
  id: UUIDString;
  __typename?: 'Review_Key';
}

export interface SeedMoviesData {
  movie_insertMany: Movie_Key[];
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Watch_Key {
  id: UUIDString;
  __typename?: 'Watch_Key';
}

/** Generated Node Admin SDK operation action function for the 'SeedMovies' Mutation. Allow users to execute without passing in DataConnect. */
export function seedMovies(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<SeedMoviesData>>;
/** Generated Node Admin SDK operation action function for the 'SeedMovies' Mutation. Allow users to pass in custom DataConnect instances. */
export function seedMovies(options?: OperationOptions): Promise<ExecuteOperationResponse<SeedMoviesData>>;

/** Generated Node Admin SDK operation action function for the 'ListPublicMovieLists' Query. Allow users to execute without passing in DataConnect. */
export function listPublicMovieLists(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPublicMovieListsData>>;
/** Generated Node Admin SDK operation action function for the 'ListPublicMovieLists' Query. Allow users to pass in custom DataConnect instances. */
export function listPublicMovieLists(options?: OperationOptions): Promise<ExecuteOperationResponse<ListPublicMovieListsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateMovieList' Mutation. Allow users to execute without passing in DataConnect. */
export function createMovieList(dc: DataConnect, vars: CreateMovieListVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateMovieListData>>;
/** Generated Node Admin SDK operation action function for the 'CreateMovieList' Mutation. Allow users to pass in custom DataConnect instances. */
export function createMovieList(vars: CreateMovieListVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateMovieListData>>;

/** Generated Node Admin SDK operation action function for the 'GetMyMovieLists' Query. Allow users to execute without passing in DataConnect. */
export function getMyMovieLists(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyMovieListsData>>;
/** Generated Node Admin SDK operation action function for the 'GetMyMovieLists' Query. Allow users to pass in custom DataConnect instances. */
export function getMyMovieLists(options?: OperationOptions): Promise<ExecuteOperationResponse<GetMyMovieListsData>>;

