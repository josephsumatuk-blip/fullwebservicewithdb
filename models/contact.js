const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const password = process.argv[2]
const dbname = 'phonebook'
const url = `mongodb+srv://josephsumatuk_db_user:${password}@cluster0.c4itgfp.mongodb.net/${dbname}?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
    process.exit(1)
  })

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(v) {
        return /\d{2,3}-\d{7,8}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`      
    }
  }})

phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', phonebookSchema)