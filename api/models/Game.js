/**
 * Game
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
	schema: true,

  attributes: {
		name : {
			type: 'string',
      minLength: 3,
      required: true,
		},

		password : {
			type: 'string',
			//required : true,
			//empty: true,
		},

		total_players: {
			type: 'integer',
			in: [3, 4],
			int: true,
			required: true,
		},

		nr_players: {
			type: 'integer',
			required: true,
		},
	},

	//TODO testare jocuri cu acelasi nume
	beforeCreate: function(values, next) {
		if(values.use_password && values.password == '') {
			return next(new Error());
		}

		if(!values.use_password) {
			values.password = '';
		}

		values['nr_players'] = 1;
		next();
	}

};
