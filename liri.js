require("dotenv").config();
const keys = require("./key.js");
const request = require("request");
const moment = require("moment");
const Spotify = require("node-spotify-api");
const fs = require("fs");
const spotify = new Spotify(keys.spotify);

let input = process.argv;
let action = input.splice(2);
let theAction = action[0];
let subAction = action.splice(1);

function liri(action, subAction) {
  if (action === `movie-this`) {
    if (subAction[0] === undefined) {
      request(
        `https://www.omdbapi.com/?t=mr+nobody&apikey=trilogy`,
        (err, res, body) => {
          let info = JSON.parse(body);
          console.log(
            `
---------------------------------------------------------------------------------------------------------
Movie: ${info.Title}
Released: ${info.Year}
IMDB Rating: ${info.imdbRating}
Rotten Tomatoes Rating: ${info.Ratings[1].Value}
Production: ${info.Production}
Language: ${info.Language}
Plot: ${info.Plot}
Actors: ${info.Actors}
---------------------------------------------------------------------------------------------------------
                `
          );
        }
      );
    } else {
      let rtScore;
      request(
        `https://www.omdbapi.com/?t=${subAction
          .join(" ")
          .trim()}&apikey=trilogy`,
        (err, res, body) => {
          let info = JSON.parse(body);
          let rt = info.Ratings;
          rt.forEach(rt => {
            if (rt.Source === "Rotten Tomatoes") {
              rtScore = rt.Value;
            }
          });
          console.log(
            `
----------------------------------------------------------------------------------------------------------
Movie: ${info.Title}
Released: ${info.Year}
IMDB Rating: ${info.imdbRating}
Rotten Tomatoes Rating: ${rtScore}
Production: ${info.Production}
Language: ${info.Language}
Plot: ${info.Plot}
Actors: ${info.Actors}
----------------------------------------------------------------------------------------------------------
                `
          );
        }
      );
    }
  } else if (action === `concert-this`) {
    request(
      `https://rest.bandsintown.com/artists/${subAction
        .join(" ")
        .trim()}/events?app_id=codingbootcamp`,
      (err, res, body) => {
        let info = JSON.parse(body);
        console.log(`Results for ${subAction.join(" ").trim()}`);
        info.forEach(venue => {
          console.log(
            `
------------------------------------------------------------------------
Name of the venue: ${venue.venue.name}
Venue location: ${venue.venue.city}
Date of the Event: ${moment(venue.datetime).format("MM/DD/YYYY")}
------------------------------------------------------------------------
                `
          );
        });
      }
    );
  } else if (action === `spotify-this-song`) {
    if (subAction[0] === undefined) {
      spotify
        .search({ type: "track", query: `The Sign` })
        .then(res => {
          let info = res.tracks.items;
          info.forEach((song, i) => {
            if (song.artists[0].name === `Ace of Base`) {
              console.log(
                `
---------------------------------------------------
Artist: ${song.artists[0].name}
Song: ${song.name}
Preview: ${song.preview_url}
Album: ${song.album.name}
---------------------------------------------------
                        `
              );
            }
          });
        })
        .catch(err => {
          console.log(err);
        });
    } else
      spotify
        .search({ type: "track", query: `${subAction.join(" ").trim()}` })
        .then(res => {
          let info = res.tracks.items;
          info.forEach((song, i) => {
            if (song.preview_url !== null) {
              console.log(
                `
---------------------------------------------------
Artist: ${song.artists[0].name}
Song: ${song.name}
Preview: ${song.preview_url}
Album: ${song.album.name}
---------------------------------------------------
                    `
              );
            }
          });
        })
        .catch(err => {
          console.log(err);
        });
  } else if (action === `do-what-it-says`) {
    let newAction;
    let newSubAction = [];
    fs.readFile("random.txt", "utf8", (err, data) => {
      newAction = data.split(",")[0];
      newSubAction = data.split(",")[1].replace(/"+/g, "");
      liri(newAction, newSubAction.split(" "));
    });
  }
}

liri(theAction, subAction);
