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
		Game.find().done(function(err, games) {
			if(err) {
				console.log("Eroare la initializarea tabelei de jocuri");
			} else {
				var obj = {games: games};
				return res.view({games: games});
			}
		});
  }, 
  
  login: function(req, res) {
    var email    = req.param('email');
    var password = req.param('password');

    User.findOne({'email': email}).done(function(err, user) {
      //TODO handle errors 
      if(err || !user) {
				console.log("Userul nu este gasit sau este o eroare de logare");
        res.redirect('/');
      } else {
        bcrypt.compare(password, user.password, function(err, flag) {
          //TODO handle errors
          if(err) {
						console.log("Userul nu este gasit sau este o eroare de logare");
            res.redirect('/');
          } else {
            if(flag) {
              req.session.authenticated = true;
							req.session.username      = user.username;
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
    var pass_conf = req.param('password_conf');
    
		if(pass_conf !== req.body.password) {
			console.log("Parola si confirmarea parolei nu sunt la fel");
			res.redirect('/');
		} else {
			User.create(req.body).done(function(err, user) {
				//TODO handle errors
				if(err) {
					console.log("Utilizator existent sau eroare de creare cont");
					res.redirect('/');
				} else {
					req.session.authenticated = true;
					req.session.username      = user.username;
					res.redirect('user/index');
				}
			});
		}
  }
  
};
