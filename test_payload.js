const fs = require("fs");
const assert = require("assert");

try {
  const data = JSON.parse(fs.readFileSync("payload.json", "utf8"));
  
  assert.ok(data.standingSummary !== undefined, "standingSummary should be defined");
  
  if (data.next_game) {
    assert.ok(data.next_game.oleMissStanding !== undefined, "next_game.oleMissStanding should be defined");
    assert.ok(data.next_game.opponentRecord !== undefined, "next_game.opponentRecord should be defined");
    assert.ok(data.next_game.opponentStanding !== undefined, "next_game.opponentStanding should be defined");
    console.log("Next game data:");
    console.log(`- Ole Miss: standing=${data.next_game.oleMissStanding}`);
    console.log(`- Opponent: record=${data.next_game.opponentRecord}, standing=${data.next_game.opponentStanding}`);
  } else {
    console.log("No upcoming game (offseason mode).");
  }
  console.log("All assertions passed successfully!");
} catch (error) {
  console.error("Test failed:", error.message);
  process.exit(1);
}
