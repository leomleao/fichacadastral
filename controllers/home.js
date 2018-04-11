const uuidv4 = require('uuid/v4');


/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  let uuid = uuidv4();
  res.render('pages/index', {
    title: 'Home',
    uuid: uuid
  });
};
