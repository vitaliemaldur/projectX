/**
 * GameController
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

module.exports = {

	index: function(req, res) {
    var game_id = req.params['id'];
    console.log(game_id);
    res.view();
  },

	create: function(req, res) {
		req.body['nr_players'] = 1;
		Game.create(req.body).done(function(err, game) {
			//TODO handle errors
			if(err) {
				console.log("Joc existent sau eroare de creare joc");
				console.log(err);
				res.redirect('/user/index');
			} else {
				res.redirect('/game/' + game.id);
			}
		});
	},

  enter: function(req, res) {
    console.log("enter");
    var game_id = req.params['id'];
    Game.findOne(game_id).done(function(err, game) {
      if(err) {
        console.log("Joc innexistent");
      } else {
        if(game.total_players > game.nr_players) {
          game.nr_players += 1;
          game.save(function(err) {
            if(err) {
              console.log("Salvare nereusita");
            }
          });
          res.redirect('/game/' + game.id);
        }
      }
    });
  },
  
};
