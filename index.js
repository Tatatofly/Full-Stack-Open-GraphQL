const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')

mongoose.set('useFindAndModify', false)

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const MONGODB_URI = `mongodb+srv://full5tack:${password}@fullstackgraphql-wnup2.mongodb.net/test?retryWrites=true`

console.log('commecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String]!
    id: ID!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks: [Book!]!
    allAuthors: [Author]!
    findAuthor(name: String!): Author
    findAuthorId(id: String!): Author
  }
  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    bookCount: () => Book.collection.countDocuments(),
    allAuthors: () => {
      return Author.find({})
    },
    allBooks: () => {
      return Book.find({})
    },
    findAuthor: (root, args) => Author.findOne({ name: args.name }),
    findAuthorId: (root, args) => Author.findById({ id: args.id })
  },
  Book: {
    author: root => {
      return {
        id: root.author
      }
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      if(args.title.length < 1 || args.published.length < 1 || args.genres.length < 1 || args.author.length < 3) {
        try {
          await Author.findOne({ name: args.author })
        } catch(error) {
          throw new UserInputError({
            invalidArgs: args,
          })
        }
      } else {
        const title = args.title
        const published = args.published
        const genres = args.genres
        let author = await Author.findOne({ name: args.author })
        if(typeof author === 'undefined' || author === null) {
          try {
            author = new Author({ name: args.author })
            await author.save()
          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })
          }
        }
        const book = new Book({ title, published, author, genres })
        try {
          await book.save()
        } catch (error) {
          console.log(error.message)
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        return book
      }
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})