import React from 'react'

const Books = ({ result, show }) => {
  if (!show) {
    return null
  }


  if ( result.loading ) {
    return (
      <div>
      <h2>books</h2>
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

const books = result.data.allBooks
const authors = result.data.allAuthors

  return (
    <div>
    <h2>books</h2>
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