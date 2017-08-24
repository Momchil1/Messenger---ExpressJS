const mongoose = require('mongoose')
const User = require('../data/User')
const Thread = require('../data/Thread')
const Message = require('../data/Message')
const errorHandler = require('../utilities/error-handler')
const messageCheck = require('../utilities/message-checker')

module.exports = {
  threadGet: (req, res) => {
    let userId = req.user._id
    let reqUsername = req.user.username
    let partnerUsername = req.params.username

    if(reqUsername === partnerUsername){
      res.locals.globalError = "You can't send message to yourself!"
      return res.render('home/index')
    }

    Thread.find({})
      .populate('userId')
      .populate('partnerId')
      .then(threads => {
        threads = threads.filter(obj =>
          (obj.userId.username === reqUsername || obj.userId.username === partnerUsername) &&
          (obj.partnerId.username === reqUsername || obj.partnerId.username === partnerUsername))
        if (threads.length > 0) {
          Thread.findById(threads[0]._id)
            .populate('userId')
            .populate('partnerId')
            .populate('messages')
            .then(populated => {
              let likedBy = ''
              for (let message of populated.messages) {
                if(message.likedBy){
                  likedBy = message.likedBy
                }
              }
              res.render('threads/thread', {
                threadId: populated._id,
                username: populated.userId.username,
                partnerUsername: populated.partnerId.username,
                messages: populated.messages,
                blockedUser: populated.userId.blockedBy,
                likedBy: likedBy
              })
            })
        }
        else {
          User.findOne({username: partnerUsername})
            .then(partner => {
              Thread.create({
                userId: userId,
                partnerId: partner._id,
                messages: []
              }).then(thread => {
                thread.save()
                User.findById(userId)
                  .then(user => {
                    user.threads.push(thread._id)
                    user.save()
                    partner.threads.push(thread._id)
                    partner.save()
                  })
                Thread.findById(thread._id)
                  .populate('userId')
                  .populate('partnerId')
                  .populate('messages')
                  .then(populated => {
                    res.render('threads/thread', {
                      threadId: populated._id,
                      username: populated.userId.username,
                      partnerUsername: populated.partnerId.username,
                      messages: populated.messages
                    })
                  })
              })
            })
        }
      })
  },

  threadPost: (req, res) => {
    let reqUsername = req.user.username
    let messageText = req.body.message || ''
    let threadId = req.params.id

    Thread.findById(threadId)
      .populate('userId')
      .populate('partnerId')
      .populate('messages')
      .then(thread => {
        // return if user is blocked
        if(thread.partnerId.username === thread.userId.blockedBy){
          return res.redirect(`/thread/${thread.partnerId.username}`)
        }

        // validate message size
        if (messageText.length > 1000 || messageText.length < 1) {
          res.locals.globalError = 'Message must be between 1 and 1000 symbols!'

          return res.render(`threads/thread`, {
            messages: thread.messages,
            threadId: threadId,
            username: thread.userId.username,
            partnerUsername: thread.partnerId.username,
          })
        }

        Message.create({
          sender: reqUsername,
          text: messageText,
          likedBy: []
        }).then(message => {
          // check message hyperlink
          switch (messageCheck.hyperlinksChecker(message.text)) {
            case 'isHyperLink':
              message.isHyperLink = true
              break
            case 'isImage':
              message.isImage = true
              break
            default:
              break
          }
          message.save()
          thread.messages.push(message)
          thread.save()
            .then(() => {
              res.render(`threads/thread`, {
                messages: thread.messages,
                threadId: threadId,
                username: thread.userId.username,
                partnerUsername: thread.partnerId.username,
              })
            })
        })
      })
  },

  blockUser: (req, res) => {
    let reqUsername = req.user.username
    let blockUser = req.params.username
    let blocked = false

    User.findOne({username: blockUser})
      .then(user => {
        if(user.blockedBy === reqUsername){
          user.blockedBy = ''
        }
        else {
          user.blockedBy = reqUsername
          blocked = true
        }
        user.save()
          .then(()=> {
            res.render('users/user-blocked', {
              username: blockUser,
              blocked: blocked
            })
          })
      })
  },

  like: (req, res) => {
    let reqUsername = req.user.username
    let threadId = req.params.threadId
    let messageId = req.params.id

    Thread.findById(threadId)
      .populate('userId')
      .populate('partnerId')
      .then(thread => {
        Message.findById(messageId)
          .then(message => {
            if(message.likedBy === reqUsername){
              message.likedBy = ''
            }
            else {
              message.likedBy = reqUsername
            }
            message.save()
              .then(() => {
                if (reqUsername === thread.userId.username){
                  res.redirect(`/thread/${thread.partnerId.username}`)
                }
                else if (reqUsername === thread.partnerId.username){
                  res.redirect(`/thread/${thread.userId.username}`)
                }
              })
          })
      })
  }
}