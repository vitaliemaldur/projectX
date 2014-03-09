/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt');

module.exports = {
  
  schema: true,
  
  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
    
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 20,
      required: true,
    },
    
    email: {
      type: 'email',
      required: true,
    },
    
    password: {
      type: 'string',
      minLength: 8,
      required: true,
    }
    
  },
  
  beforeCreate: function(values, next) {
    delete values.password_conf;
    bcrypt.hash(values.password, 10, function(err, hash) {
      if(err) return next(err);
      values.password = hash;
      next();
    });
  }

};
