var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://10.221.31.64:7687", neo4j.auth.basic("neo4j", "halkarni89"));
var session = driver.session();
var fs = require('fs')
var path = require('path')
var async = require('async')


var movieIndex = {};

var buffer = fs.readFileSync(__dirname + "/movieProperties.txt", 'utf-8').split('\n');
/*
for (var i = 0; i < buffer.length; i++) {
  var movieName = buffer[i];
  if (movieIndex.hasOwnProperty(movieName)) {
    continue;
  } else {
    console.log("adding to index")
    movieIndex[movieName] = {};
  }
}
*/

function movie() {
    // handle natural language queries
    this.timeResolution = function(qry, callback) {
        console.log("movie: time resolution ");
        console.log(qry.intent + " " + qry.entity);
        
        var readTxResultPromise = session.readTransaction(function (transaction) {
            // used transaction will be committed automatically, no need for explicit commit/rollback
            var result = transaction.run('MATCH (p:Movies) where p.releaseYear="' + qry.entity + '" AND NOT p.genre= "Adult" AND NOT p.genre="Talk-Show" AND coalesce(p.rating,-1)>8 AND coalesce(p.rating, -1) < 9 RETURN p.name as name,p.genre as genre,p.releaseYear as releaseYear limit 25');
            //var result = transaction.run('MATCH (p:Movies) where p.releaseYear="' + qry.entity + '" RETURN p.name as name,p.genre as genre ORDER BY p.rating');
            return result;
        });

        readTxResultPromise.then(function(result) {
            session.close();

            console.log("retrieved records are");
            var results = []
            result.records.forEach(function(record) {
                var Summary = "";
                var Image = "";
/*                if (movieIndex.hasOwnProperty(record.get('name'))) {
                    console.log("movie found in index");
                    Summary = record.get('name') + "summary.txt";
                    Image = record.get('name') + "image";
                }
*/
                console.log(record.get('name'))
                console.log(record.get('genre'))
                results.push({name: record.get('name'), genre: record.get('genre'), releaseYear: record.get('releaseYear'), summary: Summary, image: Image});
            });
            callback(results);
        }).catch(function(error) {
            console.log(error);
        });
    }

    this.timeAndPersonResolution = function(qry, callback) {
        console.log("movie: time and person resolution ");
        console.log(qry.intent + " " + qry.entity[0] + qry.entity[1]);
        
        var readTxResultPromise = session.readTransaction(function (transaction) {
            // used transaction will be committed automatically, no need for explicit commit/rollback
            console.log("entity array length is " + qry.entity.length)
            if (qry.entity.length > 1)
                var result = transaction.run('MATCH (q:Movies)-[]-(p:Persons) where q.releaseYear=' + qry.entity[1] + ' AND p.name="'+ qry.entity[0] + '" AND NOT q.genre contains "Adult" AND NOT q.genre contains "Talk-Show" AND NOT q.name contains "Episode" AND coalesce(q.rating,-1)>6 AND coalesce(q.rating, -1) < 9 RETURN q.name as name,q.genre as genre limit 25');
            else
                var result = transaction.run('MATCH (q:Movies)-[]-(p:Persons) where p.name="' + qry.entity[0] + '" AND NOT q.genre contains "Adult" AND NOT q.genre contains "Talk-Show" AND NOT q.name contains "Episode" AND NOT q.genre contains "Documentary" AND NOT q.genre contains "Short" and not q.genre contains "Music" and not q.name contains "Awards"   AND coalesce(q.rating,-1)>6 AND coalesce(q.rating, -1) < 9 RETURN q.name as name,q.genre as genre limit 25');

            return result;
        });

        readTxResultPromise.then(function(result) {
            session.close();
            console.log("retrieved records are");
            var results = []
            result.records.forEach(function(record) {
                console.log(record.get('name'))
                console.log(record.get('genre'))
                results.push({name: record.get('name'), genre: record.get('genre')});
            });
            callback(results);
        }).catch(function(error) {
            console.log(error);
        });
    }

    this.getCast = function(qry, callback) {
        console.log("movie: get cast ");
        console.log(qry.intent + " " + qry.entity);
        
        var readTxResultPromise = session.readTransaction(function (transaction) {
            // used transaction will be committed automatically, no need for explicit commit/rollback
            var result = transaction.run('MATCH (p:Movies)-[q:CAST]-(r:Persons) where p.name="' + qry.entity + '" RETURN r.name as personName, q.artisticRole as artRole, p.name as movieName');
            // var result = transaction.run('MATCH (p:Movies) where p.releaseYear="' + qry.entity + '" RETURN p.name as name,p.genre as genre');
            return result;
        });

        readTxResultPromise.then(function(result) {
            session.close();
            console.log("retrieved records are");
            var results = []
            result.records.forEach(function(record) {
                console.log(record.get('personName'))
                console.log(record.get('movieName'))
                console.log(record.get('artRole'))
                results.push({personName: record.get('personName'), artRole: record.get('artRole'), movieName: record.get('movieName')});
            });
            callback(results);
        }).catch(function(error) {
            console.log(error);
        });
    }

    this.bestMoviesInYear = function(qry, callback) {
        console.log("movie: get best movies in year ");
        console.log(qry.intent + " " + qry.entity);
        
        var readTxResultPromise = session.readTransaction(function (transaction) {
            // used transaction will be committed automatically, no need for explicit commit/rollback

            var result = transaction.run('MATCH (p:Movies) where p.releaseYear="' + qry.entity + '" RETURN p.name as name,p.genre as genre');
            return result;
        });

        readTxResultPromise.then(function(result) {
            session.close();
            console.log("retrieved records are");
            var results = []
            result.records.forEach(function(record) {
                console.log(record.get('name'))
                console.log(record.get('genre'))
                results.push({name: record.get('name'), genre: record.get('genre')});
            });
            callback(results);
        }).catch(function(error) {
            console.log(error);
        });
    }

    this.bestMoviesByGenre = function(qry, callback) {
        console.log("movie: get best movies by genre ");
        console.log(qry.intent + " " + qry.entity);
       
        // MATCH (p:Movies) where p.releaseYear="2016" AND NOT p.genre= "Adult" AND NOT p.genre="Talk-Show" AND p.genre="Comedy" AND coalesce(p.rating,-1)>8 AND coalesce(p.rating, -1) < 9 RETURN p limit 25
 
        var readTxResultPromise = session.readTransaction(function (transaction) {
            // used transaction will be committed automatically, no need for explicit commit/rollback

            // var result = transaction.run('MATCH (p:Movies) where p.genre contains"' + qry.entity + '" RETURN p.name as name,p.genre as genre limit 25');
            var result = transaction.run('MATCH (p:Movies) where p.genre contains "' + qry.entity + '"AND NOT p.genre= "Adult" AND NOT p.genre="Talk-Show"  AND coalesce(p.rating,-1)>7 AND coalesce(p.rating, -1) < 9 RETURN p.name as name,p.genre as genre limit 25');
            return result;
        });

        readTxResultPromise.then(function(result) {
            session.close();
            console.log("retrieved records are");
            var results = []
            result.records.forEach(function(record) {
                console.log(record.get('name'))
                console.log(record.get('genre'))
                results.push({name: record.get('name'), genre: record.get('genre')});
            });
            callback(results);
        }).catch(function(error) {
            console.log(error);
        });
    }

    this.comboQuery = function(qry, callback) {
        console.log("movie: combo query ");
        console.log(qry.intent + " " + qry.entity);
        
        var readTxResultPromise = session.readTransaction(function (transaction) {
            // used transaction will be committed automatically, no need for explicit commit/rollback

            var result = transaction.run('MATCH (p:Movies) where p.releaseYear="' + qry.entity + '" RETURN p.name as name,p.genre as genre');
            return result;
        });

        readTxResultPromise.then(function(result) {
            session.close();
            console.log("retrieved records are");
            var results = []
            result.records.forEach(function(record) {
                console.log(record.get('name'))
                console.log(record.get('genre'))
                results.push({name: record.get('name'), genre: record.get('genre')});
            });
            callback(results);
        }).catch(function(error) {
            console.log(error);
        });
    }

    // handle direct cypher queries suggested by backend
    this.suggestedQuery = function(qry) {
        console.log("suggested query for movie ");
    }
};

var mv = new movie()
module.exports = mv
