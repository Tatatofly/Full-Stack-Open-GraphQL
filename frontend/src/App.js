import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import ModifyAuthor from './components/ModifyAuthor'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { gql } from 'apollo-boost'
import { Query, Mutation  } from 'react-apollo'
import { useMutation, useApolloClient, useQuery } from 'react-apollo-hooks' 

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
    genres
  }
}
`

const ALL_AUTHORS = gql`
{
  allAuthors  {
    name,
    born,
    bookCount,
    id
  }
  allBooks  {
    title,
    published,
    author { id }
  }
}
`

const ALL_BOOKS = gql`
{
  allBooks  {
    title,
    published,
    author { id }
  }
  allAuthors  {
    name,
    born,
    id
  }
}
`

const EDIT_AUTHOR = gql`
mutation editBorn($name: String!, $setBornTo: Int!) {
  editAuthor(name: $name, setBornTo: $setBornTo)  {
    name
    born
  }
}
`

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)

  const client = useApolloClient()

  useEffect(() => {
    setToken(localStorage.getItem('library-user-token'))
  }, [])

  const handleError = (error) => {
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const logout = (client) => {
    setToken(null)
    localStorage.clear()
    //client.resetStore() Jostain syystä ei toimi tällä hetkellä
  }

  const authorsResult = useQuery(ALL_AUTHORS)
  const booksResult = useQuery(ALL_BOOKS)
  const addBook = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })
  const editAuthor = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const login = useMutation(LOGIN)


  const errorNotification = () => errorMessage &&
    <div style={{ color: 'red' }}>
      {errorMessage}
    </div>

  const [page, setPage] = useState('authors')

  if (!token) {
    return (
      <div>
        {errorNotification()}
        <h2>Login</h2>
        <LoginForm
          login={login}
          setToken={(token) => setToken(token)}
          handleError={handleError}
        />
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={logout}>logout</button>
      </div>
      <div>
        {errorNotification()}
      </div>
      <Authors result={authorsResult} show={page === 'authors'} />
      <ModifyAuthor modifyAuthor={editAuthor} result={authorsResult} show={page === 'authors'} />
      <Books result={booksResult} show={page === 'books'} />
      <NewBook createBook={addBook} show={page === 'add'} />
    </div>
  )
}

export default App
