/* define routes for the application */
// const config = require('../config');

module.exports = (app) => {
  /* health check */
  app.get('/status', (req, res) => {
    res.sendStatus(200);
  });

  /* index */
  app.get('/', (req, res) => {
    res.render('dashboard/index', {
      title: 'Dashboard',
      // csrfToken: req.csrfToken(),
    });
  });
};
