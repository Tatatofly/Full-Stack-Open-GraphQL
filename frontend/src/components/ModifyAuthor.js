import React, { useState } from 'react'


const ModifyAuthor = (props) => {
  const [name, setName] = useState('')
  const [setBornTo, setBorn] = useState('')

  const handleChange = (event) => {
    setName(event.target.value)
  }

  const submit = async (e) => {
    e.preventDefault()

    await props.editBorn({
      variables: { name, setBornTo }
    })

    setBorn('')
    setName('')
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          name 
          <select value={name} onChange={handleChange}>
            <option value="">Choose author...</option>
            {props.authors.map(a =>
              <option value={a.name} key={a.name}>{a.name}</option>
            )}
          </select>
        </div>
        <div>
          born <input
            value={setBornTo}
            onChange={({ target }) => setBorn(parseInt(target.value))}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default ModifyAuthor