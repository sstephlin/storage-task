import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface SeedMoviesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<SeedMoviesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<SeedMoviesData, undefined>;
  operationName: string;
}
export const seedMoviesRef: SeedMoviesRef;

export function seedMovies(): MutationPromise<SeedMoviesData, undefined>;
export function seedMovies(dc: DataConnect): MutationPromise<SeedMoviesData, undefined>;

interface ListPublicMovieListsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicMovieListsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPublicMovieListsData, undefined>;
  operationName: string;
}
export const listPublicMovieListsRef: ListPublicMovieListsRef;

export function listPublicMovieLists(): QueryPromise<ListPublicMovieListsData, undefined>;
export function listPublicMovieLists(dc: DataConnect): QueryPromise<ListPublicMovieListsData, undefined>;

interface CreateMovieListRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMovieListVariables): MutationRef<CreateMovieListData, CreateMovieListVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMovieListVariables): MutationRef<CreateMovieListData, CreateMovieListVariables>;
  operationName: string;
}
export const createMovieListRef: CreateMovieListRef;

export function createMovieList(vars: CreateMovieListVariables): MutationPromise<CreateMovieListData, CreateMovieListVariables>;
export function createMovieList(dc: DataConnect, vars: CreateMovieListVariables): MutationPromise<CreateMovieListData, CreateMovieListVariables>;

interface GetMyMovieListsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyMovieListsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyMovieListsData, undefined>;
  operationName: string;
}
export const getMyMovieListsRef: GetMyMovieListsRef;

export function getMyMovieLists(): QueryPromise<GetMyMovieListsData, undefined>;
export function getMyMovieLists(dc: DataConnect): QueryPromise<GetMyMovieListsData, undefined>;

