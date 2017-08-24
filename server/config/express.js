const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')
const handlebars = require('express-handlebars')

module.exports = (app) => {
  app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    helpers: {
      ifCond: function (v1, v2, options) {
        if (v1 === v2) {
          return options.fn(this)
        }

        return options.inverse(this)
      },
      ifNotEqual: function (v1, v2, options) {
        if (v1 !== v2) {
          return options.fn(this)
        }

        return options.inverse(this)
      }
    }
  }))
  app.set('view engine', 'handlebars')
  app.use(cookieParser())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(session({
    secret: 'neshto-taino!@#$%',
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  app.use((req, res, next) => {
    if (req.user) {
      res.locals.currentUser = req.user
      res.locals.isAdmin = req.user.roles.indexOf('Admin') > -1
    }

    next()
  })

  app.use(express.static('public'))

  console.log('Express ready!')
}
