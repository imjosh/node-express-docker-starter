/* eslint func-names: 0, global-require: 0 */
module.exports = (app) => {
  /* test webhook */
  app.post('/webhooks/status', (req, res) => {
    res.json({});
  });
};
