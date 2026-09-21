const fs = require("fs");
const assert = require("assert");

try {
  const data = JSON.parse(fs.readFileSync("payload.json", "utf8"));
  
  assert.ok(data.standingSummary !== undefined, "standingSummary should be defined");
  assert.ok(data.record !== undefined, "record should be defined");
  
  // During an active season after games have occurred, record must not be 0-0
  const completedGames = (data.all_games || []).filter(g => g.isCompleted);
  if (completedGames.length > 0) {
    assert.notStrictEqual(data.record, "0-0", `Ole Miss record should reflect completed games (${completedGames.length} played), got: ${data.record}`);
  }

  if (data.next_game) {
    assert.ok(data.next_game.oleMissStanding !== undefined, "next_game.oleMissStanding should be defined");
    assert.ok(data.next_game.opponentRecord !== undefined, "next_game.opponentRecord should be defined");
    assert.ok(data.next_game.opponentStanding !== undefined, "next_game.opponentStanding should be defined");
    
    // Opponent record should not be 0-0 if the opponent has already played games
    if (data.next_game.opponentName === "Florida Gators") {
      assert.strictEqual(data.next_game.opponentRecord, "3-0", `Florida record should be 3-0, got: ${data.next_game.opponentRecord}`);
      assert.strictEqual(data.next_game.opponentStanding, "1st in SEC", `Florida standing should be 1st in SEC, got: ${data.next_game.opponentStanding}`);
    }

    // Schedule[0] should be in sync with next_game
    if (data.schedule && data.schedule.length > 0) {
      assert.strictEqual(data.schedule[0].opponentRecord, data.next_game.opponentRecord, "schedule[0].opponentRecord must match next_game.opponentRecord");
      assert.strictEqual(data.schedule[0].opponentStanding, data.next_game.opponentStanding, "schedule[0].opponentStanding must match next_game.opponentStanding");
    }

    console.log("Next game data:");
    console.log(`- Ole Miss: record=${data.record}, standing=${data.next_game.oleMissStanding}`);
    console.log(`- Opponent: record=${data.next_game.opponentRecord}, standing=${data.next_game.opponentStanding}`);
  } else {
    console.log("No upcoming game (offseason mode).");
  }
  console.log("All assertions passed successfully!");
} catch (error) {
  console.error("Test failed:", error.message);
  process.exit(1);
}

