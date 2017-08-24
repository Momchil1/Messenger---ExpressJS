const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

let threadSchema = new mongoose.Schema({
  userId: {type: ObjectId, ref: 'User'},
  partnerId: {type: ObjectId, ref: 'User'},
  messages: [{type: ObjectId, ref: 'Message'}],
  createdOn: {type: Date, default: Date.now}
})

let Thread = mongoose.model('Thread', threadSchema)

module.exports = Thread