const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Started at http://localhost:3001");
    });
  } catch (e) {
    console.log(`db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//Get Players API

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id`;
  const playersArray = await db.all(getPlayersQuery);
  const ans = (playersArray) => {
    return {
      playerId: playersArray.player_id,
      playerName: playersArray.player_name,
      jerseyNumber: playersArray.jersey_number,
      role: playersArray.role,
    };
  };
  response.send(playersArray.map((eachArray) => ans(eachArray)));
});

//Post player API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team (
        player_name,jersey_number,role) VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}');`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Get Player API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE 
    player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayerQuery);
  const ans = (playerDetails) => {
    return {
      playerId: playerDetails.player_id,
      playerName: playerDetails.player_name,
      jerseyNumber: playerDetails.jersey_number,
      role: playerDetails.role,
    };
  };
  response.send(ans(playerDetails));
});

//Put Player API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team 
        SET player_name='${playerName}',
              jersey_number=${jerseyNumber},
              role='${role}'
        WHERE player_id = ${playerId};`;
  const updatedPlayer = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete Player API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteBookQuery = `DELETE FROM cricket_team 
    WHERE player_id = ${playerId};`;
  await db.run(deleteBookQuery);
  response.send("Player Removed");
});
module.exports = app;
