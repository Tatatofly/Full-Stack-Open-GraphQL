import React, { useState } from 'react'
import ModifyAuthor from './ModifyAuthor'
import { Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'

const EDIT_AUTHOR = gql`
mutation editBorn($name: String!, $setBornTo: Int!) {
  editAuthor(name: $name, setBornTo: $setBornTo)  {
    name
    born
  }
}
`

const Authors = ({ result, show, authQuery }) => {
  if (!show) {
    return null
  }

  if ( result.loading ) {
      return (
        <div>
          <h2>authors</h2>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th>
                  born
                </th>
                <th>
                  books
                </th>
              </tr>
            </tbody>
          </table>
    
        </div>
      )
    }

  const authors = result.data.allAuthors
  
  return (
    <div>
      <h2>authors</h2>
      <div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      <Mutation mutation={EDIT_AUTHOR} refetchQueries={[{ query: authQuery }]}>
        {(editAuthor) =>
          <ModifyAuthor
            editBorn={editAuthor}
            authors={authors}
          />
        }
      </Mutation>
    </div>
  )
}

export default Authors