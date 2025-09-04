

if (process.argv.length !== 4) {
  console.log('Usage:\n\n',
    '[For adding new contact info]\n',
    '   > node mongo.js <contact name> <contact number>\n\n',
  )
  process.exit(1)
}

const Contact = require('./models/contact')
const express = require('express')


const morgan = require('morgan')
const app = express()

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))
app.use(requestLogger)

app.get('/api/persons', (request, response, next) => {
    Contact.find({})
    .then(contacts=>response.json(contacts))
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  console.log(request.header)
  Contact.find({}).then(contacts=>{
    console.log(contacts.length);
    response.send(
    `<div>
    <p>Phonebook has info for ${contacts.length} people.</p>
    <p>${new Date()}</p>
    </div>`
    ).end()
  })
  .catch(error=>next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  console.log(`request id: ${id}`)
  Contact.findById(id)
    .then(contact=>{
        if (contact) {
            console.log(contact);response.json(contact)
        }
        else {
            response.status(404).end()
        }})
    .catch(error=>next(error))
})

app.delete('/api/persons/:id', (request, response, next)=> {
  const id = request.params.id
  console.log(`Delete request id:${id}`)
  Contact.findByIdAndDelete(id)
    .then(response.status(204).end())
    .catch(error=>next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = request.body
  console.log('Post request')

  // check if name is defined
  if (!person.name) {
    response.status(400).json({error: `person name is missing.`})
    return
  }
  
  if (!person.number) {
    response.status(400).json({error: `person number is missing.`})
    return
  }
  
  const nameinUC = person.name.toUpperCase() 
  console.log(nameinUC)

  Contact.find({})
  .then(contacts=>{
      const newcontact = new Contact({name: person.name, number:person.number})
      newcontact.save()
        .then(result=>response.json(result))
        .catch(error=>next(error))
    })
  .catch(error=>next(error))
})

app.put('/api/persons/:id', (request, response, next)=>{
  const newcontact = request.body
  Contact.findByIdAndUpdate(request.params.id, newcontact)
  .then(contact=>{console.log(contact);response.json(contact)})
  .catch(error=>{console.log(error);next(error)})
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})