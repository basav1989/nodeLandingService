var chai = require('chai');
var mocha = require('mocha');
var movieModel = require('../api/models/movie');
var expect = chai.expect;
var should = chai.should;

describe("check movie models", function() {
  //movieModel.suggestedQuery();
  movieModel.naturalLanguageQuery({intent: "getBio", entity: "Tom Hanks"});
});

