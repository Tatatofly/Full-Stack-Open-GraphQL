import React, { useState } from 'react'


const ModifyAuthor = (props) => {
  const [name, setName] = useState('')
  const [setBornTo, setBorn] = useState('')

  const submit = async (e) => {
    e.preventDefault()

    await props.editBorn({
      variables: { name, setBornTo }
    })

    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          name <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
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