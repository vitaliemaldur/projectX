function createDeck(nr_players) {
  var card = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  var type = ['C', 'D', 'H', 'S'];
  var index = 0;
  var deck = [];

  if(nr_players == 3)
    index = 2;

  for(var i = index; i < card.length; i++)
    for(var j = 0; j < type.length; j++)
      deck.push(type[j] + card[i]);

  deck.sort(function() {return 0.5 - Math.random()});

  return deck;
}

function firstRoundCards(game_ins, nr_players) {
  for(var i = 0; i < nr_players; i++) {
    var cards = [];
    for(var j = 0; j < 5; j++) {
      cards.push(game_ins.deck.pop());
    }
    game_ins.users_cards.push(cards);
  }
  game_ins.trump = game_ins.deck[Math.floor(Math.random() * game_ins.deck.length)];
}

function firstRoundPlay(game_ins, user_id) {
  var index = game_ins.users_ids.indexOf(user_id);

  game_ins.active_id = user_id;
  game_ins.deck.splice(game_ins.deck.indexOf(game_ins.trump), 1);
  game_ins.users_cards[index].push(game_ins.trump);

  for(var i = 0; i < game_ins.users_ids.length; i++) {
    var nr_cards = 3;

    if(index == i)
      nr_cards = 2;

    for(var j = 0; j < nr_cards; j++) {
      game_ins.users_cards[i].push(game_ins.deck.pop());
    }
  }
}

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
        GameInstance.create({id_owner: req.session.userid, id_game: game.id, users_ids: [], users_names: [],
                            deck: createDeck(game.total_players), users_cards: [], dealer: req.session.userid})
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
            if(game.total_players == game.nr_players) {//game begin
              firstRoundCards(game_ins, game.total_players);
              game_ins.save(function(err) {
                if(err) {
                  console.log("Salvare nereusita a instantei la initializare joc!");
                }
              });
              sails.io.sockets.in('room' + game.id).emit('begin', game_ins.toJSON());
              sails.io.sockets.in('room' + game.id).emit('round1', {gameInstance: game_ins.toJSON(), userid: game_ins.users_ids[1]});
            }
          }
        });
      }
    });
  },
  
  round1: function(req, res) {
    var game_id = req.body['game'];
    var user_id = req.body['user'];
    var action  = req.body['action'];
    GameInstance.findOne({id_game: game_id}, function(err, game_ins) {
      if(err) {
        console.log("Instanta jocului nu a fost gasita!");
      } else {
        var index = game_ins.users_ids.indexOf(user_id);
        if(action == "play") {
          firstRoundPlay(game_ins, user_id);

          game_ins.save(function(err) {
            if(err) {
              console.log("Salvare instanta nereusita");
            }
          });
          sails.io.sockets.in('room' + game_ins.id_game)
          .emit('allcards', game_ins.toJSON());
        } else {
          if(index == game_ins.users_ids.indexOf(game_ins.dealer)) {//round2
            sails.io.sockets.in('room' + game_ins.id_game)
            .emit('round2', {gameInstance: game_ins.toJSON(),
                             userid: game_ins.users_ids[(index + 1) % game_ins.users_ids.length],
                            play: false});
          } else {//continue round1
            index = (index + 1) % game_ins.users_ids.length;
            sails.io.sockets.in('room' + game_ins.id_game)
            .emit('round1', {gameInstance: game_ins.toJSON(), userid: game_ins.users_ids[index]});
          }
        }
        res.json();
      }
    });
  },

  round2: function(req, res) {
    GameInstance.findOne({id_game: req.body['game']}, function(err, game_ins) {
      if(err) {
        console.log("Instanta jocului nu a fost gasita!");
      } else {
        var index = game_ins.users_ids.indexOf(req.body['user']);
        if(req.body['action'] == "play") {
          firstRoundPlay(game_ins, req.body['user']);
          game_ins.trump = req.body['trump'];
          game_ins.save(function(err) {
            if(err) {
              console.log("Salvare instanta nereusita");
            }
          });
          sails.io.sockets.in('room' + game_ins.id_game)
          .emit('allcards', game_ins.toJSON());
        } else {
          index = (index + 1) % game_ins.users_ids.length;
          if(index == game_ins.users_ids.indexOf(game_ins.dealer)) {
            sails.io.sockets.in('room' + game_ins.id_game)
            .emit('round2', {gameInstance: game_ins.toJSON(), userid: game_ins.users_ids[index], play: true});
          } else {
            sails.io.sockets.in('room' + game_ins.id_game)
            .emit('round2', {gameInstance: game_ins.toJSON(), userid: game_ins.users_ids[index], play: false});
          }
        }
      }
    });
  },

};
