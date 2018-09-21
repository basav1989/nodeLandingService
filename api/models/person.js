
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://10.221.31.64:7687", neo4j.auth.basic("neo4j", "halkarni89"));
var session = driver.session();
var fs = require('fs')
var path = require('path')
var async = require('async')


var movieIndex = {};

//var buffer = fs.readFileSync(__dirname + "/personProperties.txt", 'utf-8').split('\n');
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

function person() {
    // handle natural language queries
    this.getBio = function(qry, callback) {
        console.log("person: get Info ");
        console.log(qry.intent + " " + qry.entity);
        
        var readTxResultPromise = session.readTransaction(function (transaction) {
            // used transaction will be committed automatically, no need for explicit commit/rollback
            // var result = transaction.run('MATCH (p:Persons) where p.name contains "' + qry.entity + '" RETURN p.name as name, p.bornOn as bornOn,p.roles as roles');
            var result = transaction.run('MATCH (n:Persons ) where n.name contains "' + qry.entity + '" with n,size((n)-[:CAST]-(:Movies)) as degree where degree>25  RETURN n.name as name, n.bornOn as bornOn, n.roles as roles');
            return result;
        });

        readTxResultPromise.then(function(result) {
            session.close();

            console.log("retrieved records are");
            var results = []
            result.records.forEach(function(record) {
                var Summary = "";
                var Image = "";
                /*
                if (movieIndex.hasOwnProperty(record.get('name'))) {
                    console.log("movie found in index");
                    Summary = record.get('name') + "summary.txt";
                    Image = record.get('name') + "image";
                }
                */
                console.log(record.get('name'));
                console.log(record.get('bornOn'))
                console.log(record.get('roles'))
                results.push({name: record.get('name'), bornOn: record.get('bornOn'), roles: record.get('roles'), summary: Summary, image: Image});
            });
            callback(results);
        }).catch(function(error) {
            console.log(error);
        });

    }

    this.topMovies = function(qry, callback) {
      console.log("person: top movies");
      console.log(qry.intent + " " + qry.entity);
        var readTxResultPromise = session.readTransaction(function (transaction) {
            // used transaction will be committed automatically, no need for explicit commit/rollback
            var result = transaction.run('MATCH (p:Persons)-[q:CAST]-(r:Movies) where p.name="' + qry.entity + '" AND NOT r.name contains "Episode" AND coalesce(r.rating,-1)>8 AND coalesce(r.rating, -1) < 9  RETURN p.name as personName, q.artisticRole as role,r.name as movieName LIMIT 25');
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
                /*
                if (movieIndex.hasOwnProperty(record.get('name'))) {
                    console.log("movie found in index");
                    Summary = record.get('name') + "summary.txt";
                    Image = record.get('name') + "image";
                }
                */
                console.log(record.get('personName') + " " + record.get('role') + " " + record.get('movieName'))
                results.push({artistName: record.get('personName'), role: record.get('role'), movieName: record.get('movieName')});
            });
            callback(results);
        }).catch(function(error) {
            console.log(error);
        });      
    }
}
var mv = new person()
module.exports = mv
