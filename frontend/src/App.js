import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql } from 'apollo-boost'
import { Query, Mutation, ApolloConsumer  } from 'react-apollo'

const ADD_BOOK = gql`
mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String]!) {
  addBook(
    title: $title,
    published: $published,
    author: $author,
    genres: $genres
  ) {
    title
    published
    author
    genres
  }
}
`

const ALL_AUTHORS = gql`
{
  allAuthors  {
    name,
    born,
    bookCount
  }
}
`

const ALL_BOOKS = gql`
{
  allBooks  {
    title,
    author,
    published
  }
}
`

const App = () => {
  const [page, setPage] = useState('authors')

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

    <ApolloConsumer>
      {(client => 
        <Query query={ALL_AUTHORS}>
          {(result) => 
            <Authors result={result} client={client} show={page === 'authors'}/> 
          }
        </Query> 
      )}
    </ApolloConsumer>

    <ApolloConsumer>
      {(client => 
        <Query query={ALL_BOOKS}>
          {(result) => 
            <Books result={result} client={client} show={page === 'books'}/> 
          }
        </Query> 
      )}
    </ApolloConsumer>

      
      <Mutation mutation={ADD_BOOK} refetchQueries={[{ query: ALL_AUTHORS },{ query: ALL_BOOKS }]} >
        {(addBook) =>
          <NewBook
            createBook={addBook}
            show={page === 'add'}
          />
        }
      </Mutation>

    </div>
  )
}

export default App
