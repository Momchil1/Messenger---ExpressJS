const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

let messageSchema = new mongoose.Schema({
  sender: {type: String},
  text: {type: String},
  likedBy: {type: String, default: ''},
  isHyperLink: {type: Boolean, default: false},
  isImage: {type: Boolean, default: false}
})

let Message = mongoose.model('Message', messageSchema)

module.exports = Message