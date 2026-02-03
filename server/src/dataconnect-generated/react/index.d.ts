import { SeedMoviesData, ListPublicMovieListsData, CreateMovieListData, CreateMovieListVariables, GetMyMovieListsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useSeedMovies(options?: useDataConnectMutationOptions<SeedMoviesData, FirebaseError, void>): UseDataConnectMutationResult<SeedMoviesData, undefined>;
export function useSeedMovies(dc: DataConnect, options?: useDataConnectMutationOptions<SeedMoviesData, FirebaseError, void>): UseDataConnectMutationResult<SeedMoviesData, undefined>;

export function useListPublicMovieLists(options?: useDataConnectQueryOptions<ListPublicMovieListsData>): UseDataConnectQueryResult<ListPublicMovieListsData, undefined>;
export function useListPublicMovieLists(dc: DataConnect, options?: useDataConnectQueryOptions<ListPublicMovieListsData>): UseDataConnectQueryResult<ListPublicMovieListsData, undefined>;

export function useCreateMovieList(options?: useDataConnectMutationOptions<CreateMovieListData, FirebaseError, CreateMovieListVariables>): UseDataConnectMutationResult<CreateMovieListData, CreateMovieListVariables>;
export function useCreateMovieList(dc: DataConnect, options?: useDataConnectMutationOptions<CreateMovieListData, FirebaseError, CreateMovieListVariables>): UseDataConnectMutationResult<CreateMovieListData, CreateMovieListVariables>;

export function useGetMyMovieLists(options?: useDataConnectQueryOptions<GetMyMovieListsData>): UseDataConnectQueryResult<GetMyMovieListsData, undefined>;
export function useGetMyMovieLists(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyMovieListsData>): UseDataConnectQueryResult<GetMyMovieListsData, undefined>;
