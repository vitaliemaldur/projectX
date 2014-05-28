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
    Game.findOne(game_id).done(function(err, game) {
      if(err) {
        console.log("Eroare la display joc");
        res.redirect('/user/index');
      } else {
        game.nr_players += 1;
        res.view({game: game.toJSON()});
      }
    });
  },

	create: function(req, res) {
		req.body['nr_players'] = 0;
    Game.create(req.body).done(function(err, game) {
			//TODO handle errors
			if(err) {
				console.log("Joc existent sau eroare de creare joc");
				res.redirect('/user/index');
			} else {
        GameInstance.create({id_owner: req.session.userid, id_game: game.id, users_ids: [], users_names: []})
        .done(function(err, game_ins) {
          if(err) {
            console.log("Joc existent sau eroare de creare instanta joc");
				    res.redirect('/user/index');
          } else {
            res.redirect('/game/' + game.id);
          }
        });
			}
		});
	},

  enter: function(req, res) {
    var game_id = req.body['game'];
    Game.findOne(game_id).done(function(err, game) {
      if(err) {
        console.log("Joc innexistent");
      } else {
        GameInstance.findOne({id_game: game.id}, function(err, game_ins) {
          if(game.total_players > game.nr_players) {
            game.nr_players += 1;
            game.save(function(err) {
              if(err) {
                console.log("Salvare nereusita");
              }
            });
            game_ins.users_ids.push(req.session.userid);
            game_ins.users_names.push(req.session.username);
            game_ins.save(function(err) {
              if(err) {
                console.log("Salvare instanta joc nereusita!");
              }
            });
            req.socket.join("room" + game.id);
            req.socket.broadcast.to("room" + game.id).emit('update', {game: game.toJSON(), gameInstance: game_ins.toJSON()});
            res.json(game_ins.toJSON());
          }
        });
      }
    });
  },
  
};
