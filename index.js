const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'VerySekritanduniqu3'

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
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks: [Book!]!
    allAuthors: [Author]!
    findAuthor(name: String!): Author
    findAuthorId(id: String!): Author
    me: User
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
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
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
    findAuthorId: (root, args) => Author.findById({ id: args.id }),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Book: {
    author: root => {
      return {
        id: root.author
      }
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
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
        const currentUser = context.currentUser
        if (!currentUser) {
          throw new AuthenticationError('Not authenticated')
        }
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
    editAuthor: async (root, args, context) => {
      const author = await Author.findOne({ name: args.name })
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated')
      }
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre  })
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'passu' ) {
        throw new UserInputError('Wrong username or password')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})