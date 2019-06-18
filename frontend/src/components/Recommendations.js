import React from 'react'

const Books = ({ result, show, userResult }) => {
  if (!show) {
    return null
  }

  if ( userResult.loading )  {
    return null
  }

  if ( result.loading ) {
    return (
      <div>
      <h2>Recommendations</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
        </tbody>
      </table>
    </div>
    )
  }

const genre = userResult.data.me.favoriteGenre
let books = result.data.allBooks
const authors = result.data.allAuthors

const filthBooks = () => {
  if(genre !== '') {
    let bookies = []
    books.map(b => {
      if(b.genres.includes(genre)) { 
        bookies.push(b)
      }
    })
    return bookies
  }
  return books
}

books = filthBooks()

  return (
    <div>
    <h2>Recommendations</h2> <br />
    <div>books in your favorite genre <strong>{genre}</strong></div>
    <table>
      <tbody>
        <tr>
          <th></th>
          <th>
            author
          </th>
          <th>
            published
          </th>
        </tr>
        {books.map(a =>
            <tr key={a.title}>
            <td>{a.title}</td>
            <td>{authors.find(b => a.author.id === b.id).name}</td>
            <td>{a.published}</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  )
}

export default Books