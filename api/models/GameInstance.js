/**
 * GameInstance
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    id_owner: {
      type: 'integer',
      required: true
    },

  	id_game: {
      type: 'integer',
      required: true
    },

    dealer: {
      type: 'integer',
    },

    users_ids: {
      type: 'array',
    },

    users_names: {
      type: 'array',
    },

    deck: {
      type: 'array',
    },

    trump: {
      type: 'string',
    },

    users_cards: {
      type: 'array',
    },

    active_id: {
      type: 'integer',
    },

    played_id: {
      type: 'integer',
    },

    combinations: {
      type: 'array',
    },

    scores: {
      type: 'array',
    },

    moves: {
      type: 'array',
    },

    points: {
      type: 'integer',
    },

  }

};
