const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at https//localhost:3000");
    });
  } catch (e) {
    console.log(`DBError:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//-------------------------------------------------------------------------------

const convertToCamelCase = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
};
const hasPlayerJerseyRole = (playerName, jerseyNumber, role) => {
  return (
    playerName !== undefined && jerseyNumber !== undefined && role !== undefined
  );
};
const hasPlayerJersey = (playerName, jerseyNumber, role) => {
  return playerName !== undefined && jerseyNumber !== undefined;
};
const hasPlayerRole = (playerName, jerseyNumber, role) => {
  return playerName !== undefined && role !== undefined;
};
const hasJerseyRole = (playerName, jerseyNumber, role) => {
  return jerseyNumber !== undefined && role !== undefined;
};
const hasPlayer = (playerName, jerseyNumber, role) => {
  return playerName !== undefined;
};
const hasJersey = (playerName, jerseyNumber, role) => {
  return jerseyNumber !== undefined;
};
const hasRole = (playerName, jerseyNumber, role) => {
  return role !== undefined;
};

const getUpdatePlayerQuery = (playerName, jerseyNumber, role) => {
  let query;
  switch (true) {
    case hasPlayerJerseyRole(playerName, jerseyNumber, role):
      query = `INSERT into 
                    cricket_team(
                        player_name,
                        jersey_number,
                        role
                        )
                    Values(
                    '${playerName}',
                    '${jerseyNumber}',
                    '${role}')
                    ;`;
      break;
    case hasPlayerJersey(playerName, jerseyNumber, role):
      query = `INSERT into 
                    cricket_team(
                        player_name,
                        jersey_number
                        )
                    Values('${playerName}',
                    '${jerseyNumber}'
                    ;`;
      break;
    case hasPlayerRole(playerName, jerseyNumber, role):
      query = `INSERT into 
                    cricket_team(
                        player_name,
                        role
                        )
                    Values
                    '${playerName}',
                    '${role}')
                    ;`;
      break;
    case hasJerseyRole(playerName, jerseyNumber, role):
      query = `INSERT into 
                    cricket_team(
                        jersey_number,
                        role
                        )
                    Values(
                    '${jerseyNumber}',
                    '${role}')
                    ;`;
      break;
    case hasPlayer(playerName, jerseyNumber, role):
      query = `INSERT into 
                    cricket_team(
                        player_name
                        )
                    Values(
                        '${playerName}'
                    ;`;
      break;
    case hasJersey(playerName, jerseyNumber, role):
      query = `INSERT into 
                    cricket_team(
                        jersey_number
                        )
                    Values(
                    '${jerseyNumber}'
                    ;`;
      break;
    case hasRole(playerName, jerseyNumber, role):
      query = `INSERT into 
                    cricket_team(
                        role
                        )
                    Values(
                    '${role}'
                    )
                    ;`;
      break;
    default:
      break;
  }
  return query;
};

//-------------------------------------------------------------------------------

//API (1) GET list of All Plyers
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team order by player_id;`;
  const totalPlayers = await db.all(getPlayersQuery);
  response.send(totalPlayers);
});

//Api (2) add  a player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  console.log(playerDetails);
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT into 
  cricket_team(player_name,jersey_number,role)
    values('${playerName}','${jerseyNumber}','${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Api 3 get player details by id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team
    where player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertToCamelCase(player));
});

//Api  4 update player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  console.log(
    playerName,
    jerseyNumber,
    role,
    "....................................."
  );
  const upPlayerQuery = `update cricket_team 
                               SET 
                                  player_name='${playerName}',
                                  jersey_number=${jerseyNumber},
                                  role='${role}' 
                               where 
                                  player_id=${playerId};
                                `;
  const dbResponse = await db.run(upPlayerQuery);
  response.send("Player Details Updated");
});
// Api 5 delete player details
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `Delete from cricket_team where player_id=${playerId};`;
  const dbResponse = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
