const mongoose = require('mongoose')
const User = require('../data/User')
const Thread = require('../data/Thread')

module.exports = {
  index: (req, res) => {
    let search = req.query.search
    let query = User.find({})


    if (search) {
      query = query.where('username').regex(new RegExp(search, 'i'))
    }

    query
      .then(users => {
        Thread.find({})
          .populate('userId')
          .populate('partnerId')
          .then(threads => {
            if(req.user){
              // взимаме само тредовете на логнатия юзър
              threads = threads.filter(obj => obj.userId.username === req.user.username || obj.partnerId.username === req.user.username)
            }
            res.render('home/index', {
              users: users,
              threads: threads.sort((a, b) => b.createdOn - a.createdOn)
            })
          })
      })
  }
}
