# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useSeedMovies, useListPublicMovieLists, useCreateMovieList, useGetMyMovieLists } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useSeedMovies();

const { data, isPending, isSuccess, isError, error } = useListPublicMovieLists();

const { data, isPending, isSuccess, isError, error } = useCreateMovieList(createMovieListVars);

const { data, isPending, isSuccess, isError, error } = useGetMyMovieLists();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { seedMovies, listPublicMovieLists, createMovieList, getMyMovieLists } from '@dataconnect/generated';


// Operation SeedMovies: 
const { data } = await SeedMovies(dataConnect);

// Operation ListPublicMovieLists: 
const { data } = await ListPublicMovieLists(dataConnect);

// Operation CreateMovieList:  For variables, look at type CreateMovieListVars in ../index.d.ts
const { data } = await CreateMovieList(dataConnect, createMovieListVars);

// Operation GetMyMovieLists: 
const { data } = await GetMyMovieLists(dataConnect);


```