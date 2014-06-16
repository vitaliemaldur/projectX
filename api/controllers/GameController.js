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

  game_ins.active_id = game_ins.played_id = user_id;
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

function addCombination(container, combination, user_id, card, trump) {
  if(combination.length >= 3) {
    switch(combination.length) {
      case 3:
        container.push({userid: user_id, comb: combination, points: 2, index: card - 3});
        break;
      case 4:
        container.push({userid: user_id, comb: combination, points: 5, index: card - 4});
        break;
      case 5:
        container.push({userid: user_id, comb: combination, points: 10, index: card - 5});
        break;
      default:
        container.push({userid: user_id, comb: combination, points: 10, index: card - combination.length});
    }
  }
}

function comparator(a, b) {
  if(b.points == a.points && b.length == a.length)
    return b.index - a.index;

  if(b.points == a.points && b.length != a.length)
    return b.length - a.length;

  return b.points - a.points;
}

function getCombinations(game_ins) {
  var order = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'], type = ['C', 'D', 'H', 'S'];
  //order.reverse();
  var consecutive = [], fourcards = [], combinations = [];
  for(var i = 0; i < game_ins.users_ids.length; i++) {
    var cards = game_ins.users_cards[i];
    var user_id = game_ins.users_ids[i];
    //consecutive combinations
    for(var symbol = 0; symbol < type.length; symbol++) {
      consecutive = [];
      for(var card = 0; card < order.length; card++) {
        var candidat = type[symbol] + order[card];
        if(cards.indexOf(candidat) != -1) {
          consecutive.push(candidat);
          if(card == order.length - 1)
            addCombination(combinations, consecutive, user_id, card, game_ins.trump);
        } else {
          addCombination(combinations, consecutive, user_id, card, game_ins.trump);
          consecutive = [];
        }
      }
    }
    //four card combination
    for(var card = 2; card < order.length; card++) {
      fourcards = [];
      for(var symbol = 0; symbol < type.length; symbol++) {
        var candidat = type[symbol] + order[card];
        if(cards.indexOf(candidat) != -1)
          fourcards.push(candidat);
      }
      if(fourcards.length == 4) {
        switch(order[card]) {
          case '9':
            combinations.push({userid: user_id, comb: fourcards, points: 14, index: card});
            break;
          case 'J':
            combinations.push({userid: user_id, comb: fourcards, points: 20, index: card});
            break;
          default:
            combinations.push({userid: user_id, comb: fourcards, points: 10, index: card});
        }
      }
    }
    if(cards.indexOf(game_ins.trump.charAt(0) + 'K') != -1 &&
       cards.indexOf(game_ins.trump.charAt(0) + 'Q') != -1)
      combinations.push({userid: user_id, comb: [game_ins.trump.charAt(0) + 'K', game_ins.trump.charAt(0) + 'Q'],
                        points: 2, index: order.indexOf('Q')});
  }

  combinations.sort(comparator);

  game_ins.combinations = combinations;
  game_ins.points = 16;
  if(combinations.length > 0) {
    for(var i = 0; i < combinations.length - 1; i++) {
      for(var j = i + 1; j < combinations.length; j++) {
        if(combinations[i].points == combinations[j].points && combinations[i].length == combinations[j].length &&
          combinations[i].index == combinations[j].index) {
          if(combinations[i].comb[0].charAt(0) != game_ins.trump.charAt(0))
            combinations[i].userid = -1;
          if(combinations[j].comb[0].charAt(0) != game_ins.trump.charAt(0))
            combinations[j].userid = -1;
        }
      }
    }

    var userid = combinations[0].userid;
    game_ins.combinations = combinations.filter(function(elem) {
      return elem.userid == userid || elem.comb.length == 2;
    });


    for(var i = 0; i < game_ins.combinations.length; i++) {
      game_ins.points += game_ins.combinations[i].points;
    }
  }
}

function getScore(game_ins) {
  var notrump = ['7', '8', '9', 'J', 'Q', 'K', '10', 'A'];
  var points1 = [0, 0, 0, 2, 3, 4, 10, 11];
  var points2 = [0, 0, 3, 4, 10, 11, 14, 20];
  var withtrump = ['7', '8', 'Q', 'K', '10', 'A', '9', 'J'];
  var first_card_index = game_ins.users_ids.indexOf(game_ins.active_id);
  first_card_index = (first_card_index + 1) % game_ins.users_ids.length;
  var max_index = first_card_index;
  var use_trump = false;
  for(var i = 0; i < game_ins.moves.length; i++) {
    if(i != first_card_index) {
      if(game_ins.moves[first_card_index].charAt(0) == game_ins.trump.charAt(0)) {
        var current_max = withtrump.indexOf(game_ins.moves[max_index].substring(1));
        var candidatate = withtrump.indexOf(game_ins.moves[i].substring(1));
        if(game_ins.moves[i].charAt(0) == game_ins.trump.charAt(0) && current_max < candidatate)
          max_index = i;
      } else {
        if(!use_trump && game_ins.moves[i].charAt(0) == game_ins.moves[first_card_index].charAt(0)) {
          var current_max = notrump.indexOf(game_ins.moves[max_index].substring(1));
          var candidatate = notrump.indexOf(game_ins.moves[i].substring(1));
          if(current_max < candidatate) max_index = i;
        }

        if(game_ins.moves[i].charAt(0) == game_ins.trump.charAt(0)) {
          if(!use_trump) max_index = i;
          use_trump = true;
          var current_max = withtrump.indexOf(game_ins.moves[max_index].substring(1));
          var candidatate = withtrump.indexOf(game_ins.moves[i].substring(1));
          if(current_max < candidatate) max_index = i;
        }
      }
    }
  }
  game_ins.active_id = game_ins.users_ids[max_index];
  for(var i = 0; i < game_ins.moves.length; i++) {
    if(game_ins.moves[i].charAt(0) == game_ins.trump.charAt(0)) {
      game_ins.scores[max_index] += points2[withtrump.indexOf(game_ins.moves[i].substring(1))];
    } else {
      game_ins.scores[max_index] += points1[notrump.indexOf(game_ins.moves[i].substring(1))];
    }
  }
  console.log(game_ins);
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
        var scores = new Array(game.total_players);
        var final = new Array(game.total_players);
        var moves = new Array(game.total_players);
        for(var i = 0; i < game.total_players; i++) {
          scores[i] = final[i] = 0;
          moves[i] = '';
        }
        GameInstance.create({id_owner: req.session.userid, id_game: game.id, users_ids: [], users_names: [],
                            deck: createDeck(game.total_players), users_cards: [], dealer: req.session.userid,
                            combinations: [], scores: scores, moves: moves, points: 0, final_scores: final})
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
              var next = (game_ins.users_ids.indexOf(game_ins.dealer) + 1) % game_ins.users_ids.length;
              sails.io.sockets.in('room' + game.id).emit('round1', {gameInstance: game_ins.toJSON(), userid: game_ins.users_ids[next]});
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
          getCombinations(game_ins);

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
          getCombinations(game_ins);
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

  move: function(req, res) {
    GameInstance.findOne({id_game: req.body['game']}, function(err, game_ins) {
      if(err) {
        console.log("Intanta jocului nu a fost gasita! in functia move");
      } else {
        var index = game_ins.users_ids.indexOf(game_ins.active_id);
        var clear_flag = false;
        game_ins.moves[index] = req.body['card'];
        game_ins.users_cards[index].splice(game_ins.users_cards[index].indexOf(req.body['card']), 1);
        index = (index + 1) % game_ins.users_ids.length;

        if(game_ins.moves.indexOf('') == -1) {//all players moved
          getScore(game_ins);
          clear_flag = true;
          for(var i = 0; i < game_ins.moves.length; i++)
            game_ins.moves[i] = '';
        } else {
          game_ins.active_id = game_ins.users_ids[index];
        }

        game_ins.save(function(err) {
          if(err) {
            console.log("Salvare instanta nereusita");
          }
        });
        //send move to all players
        sails.io.sockets.in("room" + game_ins.id_game)
        .emit('move', {card: req.body['card'], clear: clear_flag, gameInstance: game_ins.toJSON()});
        res.json(game_ins.toJSON());

        //check if is the last move
        var flag = true;
        for(var i = 0; i < game_ins.users_cards.length; i++) flag = flag && game_ins.users_cards[i].length == 0;
        if(flag) {
          for(var i = 0; i < game_ins.scores.length; i++) {
            if(game_ins.scores[i] % 10 <= 5)
              game_ins.scores[i] = Math.floor(game_ins.scores[i] / 10);
            else
              game_ins.scores[i] = Math.ceil(game_ins.scores[i] / 10);
          }
          //add combinations
          for(var i = 0; i < game_ins.combinations.length; i++) {
            var id = game_ins.users_ids.indexOf(game_ins.combinations[i].userid);
            if(game_ins.scores[id] == 0 && game_ins.combinations[i].comb.length != 2)
              game_ins.points -= game_ins.combinations[i].points;
            else
              game_ins.scores[id] += game_ins.combinations[i].points;
          }
          //last moves
          if(game_ins.active_id != game_ins.played_id) {
            game_ins.scores[game_ins.users_ids.indexOf(game_ins.active_id)] += 1;
          }
          //points for main player
          var id = game_ins.users_ids.indexOf(game_ins.played_id);
          game_ins.scores[id] = game_ins.points;
          for(var i = 0; i < game_ins.scores.length; i++) {
            if(i != id)
              game_ins.scores[id] -= game_ins.scores[i];
          }
          //verify
          var max_id = id;
          for(var i = 0; i < game_ins.scores.length; i++) {
            if(game_ins.scores[i] == 0 && i != id)
              game_ins.scores[i] -= 10;
            if(game_ins.scores[i] > game_ins.scores[max_id])
              max_id = i;
          }
          //verify
          if(max_id != id) {
            game_ins.scores[max_id] += game_ins.scores[id];
            game_ins.scores[id] = 0;
          }
          //add do final scores
          for(var i = 0; i < game_ins.scores.length; i++) {
            game_ins.final_scores[i] += game_ins.scores[i];
            game_ins.scores[i] = 0;
          }
          sails.io.sockets.in("room" + game_ins.id_game).emit('score', game_ins.toJSON());

          //prepare for next round
          var next_dealer = (game_ins.users_ids.indexOf(game_ins.dealer) + 1) % game_ins.users_ids.length;
          game_ins.dealer = game_ins.users_ids[next_dealer];

          game_ins.deck = createDeck(game_ins.users_ids.length);
          game_ins.users_cards = [];
          firstRoundCards(game_ins, game_ins.users_ids.length);

          game_ins.points = 0;

          game_ins.save(function(err) {
            if(err) {
              console.log("Salvare instanta nereusita");
            }
          });
          console.log(game_ins);
          sails.io.sockets.in('room' + game_ins.id_game).emit('begin', game_ins.toJSON());
          var next = (game_ins.users_ids.indexOf(game_ins.dealer) + 1) % game_ins.users_ids.length;
          sails.io.sockets.in('room' + game_ins.id_game)
          .emit('round1', {gameInstance: game_ins.toJSON(), userid: game_ins.users_ids[next]});
        }
      }
    });
  },

};
