var movieModel = require('../models/movie');
var personModel = require('../models/person');

module.exports = function(app) {

    app.route('/natLangQry').post(function(req, res, next) {
        console.log(req);
        console.log("/natLangQry " + req.body);
        var body = JSON.stringify(req.body);        
        console.log(body)

        switch(req.body.intent) {
            case "get_top_movies_by_time": {
                movieModel.timeResolution(req.body, function(results) {
                    res.send(results);
                });
                break;
                }
            case "get_movies_by_time_and_person": {
                movieModel.timeAndPersonResolution(req.body, function(results) {
                    res.send(results);
                });
                break;
                }
            case "get_info": {
                personModel.getBio(req.body, function(results) {
                    res.send(results);
                });
                break;
                }
            case "get_cast": {
                movieModel.getCast(req.body, function(results) {
                    res.send(results);
                });
                break;
                }
             case "get_person_best_movie": {
                personModel.topMovies(req.body, function(results) {
                    res.send(results);
                });
                break;
                }
            case "get_best_movie_in_year": {
                movieModel.bestMoviesInYear(req.body, function(results) {
                    res.send(results);
                });
                break;
                }
            case "get_best_movie_genre": {
                movieModel.bestMoviesByGenre(req.body, function(results) {
                    res.send(results);
                });
                break;
                }
            case "get_movies_people_combo": {
                movieModel.comboQuery(req.body, function(results) {
                    res.send(results);
                });
                break;
                }
            default: {
                console.log("unrecognzed intent");
                res.send("unrecognized intent");
            }
        }
    });
};
