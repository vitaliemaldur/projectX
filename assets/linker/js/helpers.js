function stack_cards(id_container) {
  var count  = $(id_container).children().length;
  var width  = $(id_container).width();
  var height = $(id_container).height();
  var card_width = $(id_container).children().first().width();
  var all_cards_width = card_width + ((count - 1) * card_width / 2);
  var offset = (width - all_cards_width) / 2;
  var array_img = $(id_container).children();
  $(id_container).children().first().css("margin-left", offset);
  for(var i = 1; i < count; i++) {
    var img = array_img[i];
    $(img).css("margin-left", -1 * card_width / 2);
  }
}

function updateScoreBoardNames(game_ins) {
  for(var i = 0; i < game_ins.users_names.length; i++) {
    $("#player" + (i + 1)).html('<span class="label label-default">' + game_ins.users_names[i] + '</span>');
  }
}

function updateActiveUser(game_ins, user_id) {
  var index = game_ins.users_ids.indexOf(user_id);
  for(var i = 0; i < game_ins.users_ids.length; i++) {
    $("#player" + (i + 1)).children().first().removeClass('label-primary').addClass('label-default');
  }
  $("#player" + (index + 1)).children().first().addClass('label-primary');
}

function display_buttons(first_char, play, id, user_id) {
  $('#play-btn').hide();

  $("#pass-btn").click(function() {
    console.log("da");
    socket.post("/game/round2", {game: id, user: user_id, action: "pass"}, function(data) {
      //if is passing
    });
    $('#play-btn').show();
    $("#round2-chooser").empty();
    $('#first-round-btns').css("visibility", "hidden");
  });

  if(play) {
    $("#pass-btn").hide();
  }

  var div = $("#round2-chooser");
  if(first_char != 'S')
    div.append('<button id="spades" type="button"  class="btn btn-default">' +
               '<span class="card-type" style="color:black">♠</span></button>');
  if(first_char != 'H')
    div.append('<button id="hearts" type="button" class="btn btn-default">' +
          '<span class="card-type" style="color:red">♥</span></button>');
  if(first_char != 'C')
    div.append('<button id="clubs" type="button" class="btn btn-default">' +
          '<span class="card-type" style="color:black">♣</span></button>');
  if(first_char != 'D')
    div.append('<button id="diamonds" type="button" class="btn btn-default">' +
          '<span class="card-type" style="color:red">♦</span></button>');

  div.ready(function() {
    $("#clubs").click(function() {
      socket.post("/game/round2", {game: id, user: user_id, action: "play", trump: "C"}, function(data) {
      //if is playing
      });
      $('#play-btn').show();
      $("#round2-chooser").empty();
      $('#first-round-btns').css('visibility', 'hidden');
      if(play) $("#pass-btn").show();
    });

    $("#spades").click(function() {
      socket.post("/game/round2", {game: id, user: user_id, action: "play", trump: "S"}, function(data) {
      //if is playing
      });
      $('#play-btn').show();
      $("#round2-chooser").empty();
      $('#first-round-btns').css('visibility', 'hidden');
      if(play) $("#pass-btn").show();
    });

    $("#hearts").click(function() {
      socket.post("/game/round2", {game: id, user: user_id, action: "play", trump: "H"}, function(data) {
      //if is playing
      });
      $('#play-btn').show();
      $("#round2-chooser").empty();
      $('#first-round-btns').css('visibility', 'hidden');
      if(play) $("#pass-btn").show();
    });

    $("#diamods").click(function() {
      socket.post("/game/round2", {game: id, user: user_id, action: "play", trump: "D"}, function(data) {
      //if is playing
      });
      $('#play-btn').show();
      $("#round2-chooser").empty();
      $('#first-round-btns').css('visibility', 'hidden');
      if(play) $("#pass-btn").show();
    });

    $('#first-round-btns').css('visibility', 'visible');

  });
}
