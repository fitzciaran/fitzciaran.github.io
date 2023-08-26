let sendCounter = 0;

export function sendPlayerStates(player,connections){
    // Check if connection is open before sending data
     // Send game state to other player
     let data = {
       id: player.id,
       x: player.x,
       y: player.y,
       angle: player.angle,
       color: player.color,
       powerUps: player.powerUps,
     };
     //console.log("Sending data:", data); // Log any data sent
     connections.forEach((conn) => {
       if (conn && conn.open) {
         conn.send(data);
         sendCounter++;
         // Log the data every 1000 calls
         if (sendCounter === 1000) {
           console.log("sending data:", data);
           sendCounter = 0; // reset the counter
         }
       }
     });
 }

 export function sendPowerups(globalPowerUps,connections) {
  let powerUpData = {
    globalPowerUps: globalPowerUps,
  };

  connections.forEach((conn) => {
    if (conn && conn.open) {
      conn.send(powerUpData);
    }
  });
}