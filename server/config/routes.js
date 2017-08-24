const controllers = require('../controllers')
const auth = require('./auth')

module.exports = (app) => {
  app.get('/', controllers.home.index)
  app.get('/thread/:username', auth.isAuthenticated, controllers.threads.threadGet)
  app.post('/thread/:id', auth.isAuthenticated, controllers.threads.threadPost)

  app.post('/block/:username', auth.isAuthenticated, controllers.threads.blockUser)
  app.post('/like/:threadId/:id', auth.isAuthenticated, controllers.threads.like)

  app.get('/users/register', controllers.users.registerGet)
  app.post('/users/register', controllers.users.registerPost)
  app.get('/users/login', controllers.users.loginGet)
  app.post('/users/login', controllers.users.loginPost)
  app.post('/users/logout', controllers.users.logout)

  app.all('*', (req, res) => {
    res.status(404)
    res.send('404 Not Found!')
    res.end()
  })
}
