/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var bcrypt = require('bcrypt');

module.exports = {
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  index: function(req, res) {
    res.view();
  }, 
  
  login: function(req, res) {
    var email    = req.param('email');
    var password = req.param('password');

    User.findOne({'email': email}).done(function(err, user) {
      //TODO handle errors 
      if(err) {
        console.log(err);
      } else {
        console.log(user);
        bcrypt.compare(password, user.password, function(err, flag) {
          //TODO handle errors
          if(err) {
            console.log(err);
          } else {
            if(flag) {
              req.session.authenticated = true;
              res.redirect('/user/index');
            } else {
              res.redirect('/');
            }
          }
        });
      }
    });  
  },

	logout: function(req, res) {
		req.session.authenticated = false;
		res.redirect('/');
	},
  
  create: function(req, res) {
    var username  = req.param('username');
    var email     = req.param('email');
    var password  = req.param('password');
    var pass_conf = req.param('password_conf');
    
    User.create(req.body).done(function(err, user) {
      //TODO handle errors
      if(err) {
				console.log(err);
			} else {
				req.session.authenticated = true;
				res.redirect('user/index');
			}
    });
  }
  
};
