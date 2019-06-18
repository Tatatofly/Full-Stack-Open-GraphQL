import React, { useState } from 'react'

const Books = ({ result, show }) => {
  if (!show) {
    return null
  }

  let allGenres = []

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

const [genre, setGen] = useState('')

const handleChange = (event) => {
  setGen(event.target.value)
}

let books = result.data.allBooks
const authors = result.data.allAuthors

const getGenres = () => {
  let genres = []
  books.map(b => b.genres.map(g => genres.push(g)))
  return [...new Set(genres)];
}

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

allGenres = getGenres()
books = filthBooks()

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
    <br />
    <div>
          Filter by Genre 
          <select value={genre} onChange={handleChange}>
            <option value=""> </option>
            {allGenres.map(a =>
              <option value={a} key={a}>{a}</option>
            )}
          </select>
        </div>
  </div>
  )
}

export default Books