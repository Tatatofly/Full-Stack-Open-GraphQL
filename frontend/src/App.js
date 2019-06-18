import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import ModifyAuthor from './components/ModifyAuthor'
import Books from './components/Books'
import Recommendations from './components/Recommendations'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { gql } from 'apollo-boost'
import { useMutation, useQuery } from 'react-apollo-hooks' 
import { Subscription } from 'react-apollo'

const BOOK_DETAILS = gql`
fragment BookDetails on Book {
  title
  published
  author { 
    name
  }
  genres
}
`

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
    author { id },
    genres
  }
  allAuthors  {
    name,
    born,
    id
  }
}
`

const ME = gql`
{
  me {
    username,
    favoriteGenre
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

const BOOK_ADDED = gql`
subscription {
  BookAdded {
    ...BookDetails
  }
}
${BOOK_DETAILS} 
`

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)

  //(const client = useApolloClient()

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
    //client.resetStore() Jostain syystä ei toimi tällä hetkellä. Pidetään siis poissa käytöstä.
  }

  const authorsResult = useQuery(ALL_AUTHORS)
  const booksResult = useQuery(ALL_BOOKS)
  const userResult = useQuery(ME)
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
        <button onClick={() => setPage('recom')}>recommend</button>
        <button onClick={logout}>logout</button>
      </div>
      <div>
        {errorNotification()}
      </div>
      <Authors result={authorsResult} show={page === 'authors'} />
      <ModifyAuthor modifyAuthor={editAuthor} result={authorsResult} show={page === 'authors'} />
      <Books result={booksResult} show={page === 'books'} />
      <Recommendations result={booksResult} show={page === 'recom'} userResult={userResult} />
      <NewBook createBook={addBook} show={page === 'add'} />
      <Subscription
        subscription={BOOK_ADDED}
        onSubscriptionData={({subscriptionData}) => {
          console.log(subscriptionData)
          window.alert(subscriptionData.data.bookAdded.title);
        }}>
        {() => null}
      </Subscription>
    </div>
  )
}

export default App
