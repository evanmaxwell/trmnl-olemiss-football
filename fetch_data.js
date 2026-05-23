const fs = require("fs");

const OLE_MISS_TEAM_ID = "145";
const CURRENT_YEAR = new Date().getFullYear();

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  return res.json();
}

async function getSchedule() {
  // Try current year first
  let data = await fetchJson(
    `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${OLE_MISS_TEAM_ID}/schedule?season=${CURRENT_YEAR}`,
  );

  // If no events and it's early in the year, check the previous year (to show last season's results/bowl game)
  if (data.events.length === 0) {
    data = await fetchJson(
      `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${OLE_MISS_TEAM_ID}/schedule?season=${CURRENT_YEAR - 1}`,
    );
  }
  return data;
}

async function getTop25Rankings() {
  const data = await fetchJson(
    `https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings`,
  );
  return data;
}

function formatDateET(dateString) {
  const d = new Date(dateString);
  // Example output: "Sat, Sep 2 at 3:30 PM ET"
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/New_York",
  };
  return d.toLocaleString("en-US", options);
}

async function main() {
  try {
    const scheduleData = await getSchedule();
    const rankingsData = await getTop25Rankings();

    // Extract Ole Miss Rank
    let currentRank = "NR";
    if (
      rankingsData &&
      rankingsData.rankings &&
      rankingsData.rankings.length > 0
    ) {
      // Find AP Top 25 (type: "1", name: "AP Top 25") or the first available ranking
      const poll =
        rankingsData.rankings.find((r) => r.name === "AP Top 25") ||
        rankingsData.rankings[0];
      if (poll && poll.ranks) {
        const teamRank = poll.ranks.find((r) => r.team.id === OLE_MISS_TEAM_ID);
        if (teamRank) {
          currentRank = teamRank.current;
        }
      }
    }

    const events = scheduleData.events || [];
    let processedGames = [];
    let nextGame = null;
    let mostRecentGame = null;

    const now = new Date();

    events.forEach((event) => {
      const gameDate = new Date(event.date);
      const isCompleted = event.competitions[0].status.type.completed;

      const homeTeam = event.competitions[0].competitors.find(
        (c) => c.homeAway === "home",
      );
      const awayTeam = event.competitions[0].competitors.find(
        (c) => c.homeAway === "away",
      );

      const oleMiss = homeTeam.id === OLE_MISS_TEAM_ID ? homeTeam : awayTeam;
      const opponent = homeTeam.id === OLE_MISS_TEAM_ID ? awayTeam : homeTeam;

      // Determine outcome
      let outcome = "";
      let scoreStr = "";
      if (isCompleted) {
        const omScore = parseInt(oleMiss.score?.value || 0, 10);
        const oppScore = parseInt(opponent.score?.value || 0, 10);
        if (omScore > oppScore) outcome = "W";
        else if (omScore < oppScore) outcome = "L";
        else outcome = "T";
        scoreStr = `${Math.max(omScore, oppScore)}-${Math.min(omScore, oppScore)}`;
      }

      // Determine network
      let network = "TBD";
      if (
        event.competitions[0].broadcasts &&
        event.competitions[0].broadcasts.length > 0
      ) {
        const broadcasts = event.competitions[0].broadcasts;
        // Prioritize national TV or just pick the first
        network =
          broadcasts[0].media?.shortName || broadcasts[0].names?.[0] || "TBD";
      }

      const gameObj = {
        name: event.name,
        shortName: event.shortName,
        date: formatDateET(event.date),
        rawDate: event.date,
        isCompleted: isCompleted,
        opponentName: opponent.team.displayName,
        opponentAbbrev: opponent.team.abbreviation,
        opponentLogo: opponent.team.logos?.[0]?.href || "",
        homeAway: oleMiss.homeAway === "home" ? "vs" : "@",
        outcome: outcome,
        score: scoreStr,
        network: network,
        statusStr: event.competitions[0].status.type.shortDetail,
      };

      processedGames.push(gameObj);

      if (isCompleted) {
        mostRecentGame = gameObj; // Keeps updating to the latest completed game
      } else if (!nextGame && !isCompleted && gameDate >= now) {
        // If it's the first non-completed game in the future
        nextGame = gameObj;
      }
    });

    // If we're past the season, nextGame might still be null, but maybe there's an uncompleted game (bowl/championship)
    // that is technically in the past according to our `now` but hasn't played or was cancelled?
    // For safety, just use the first non-completed game if nextGame is still null
    if (!nextGame) {
      nextGame = processedGames.find((g) => !g.isCompleted);
    }

    // Build schedule for inspiration.html
    let inspirationSchedule = [];
    events.forEach((event) => {
      const isCompleted = event.competitions[0].status.type.completed;
      const homeTeam = event.competitions[0].competitors.find(c => c.homeAway === 'home');
      const awayTeam = event.competitions[0].competitors.find(c => c.homeAway === 'away');
      const oleMiss = homeTeam.id === OLE_MISS_TEAM_ID ? homeTeam : awayTeam;
      const opponent = homeTeam.id === OLE_MISS_TEAM_ID ? awayTeam : homeTeam;

      let venueStr = "TBD";
      if (event.competitions[0].venue) {
        const venue = event.competitions[0].venue;
        const city = venue.address?.city || "";
        const state = venue.address?.state || "";
        venueStr = city && state ? `${city}, ${state}` : venue.fullName || "TBD";
      }

      let network = "TBD";
      if (event.competitions[0].broadcasts && event.competitions[0].broadcasts.length > 0) {
        network = event.competitions[0].broadcasts[0].media?.shortName || event.competitions[0].broadcasts[0].names?.[0] || "TBD";
      }

      inspirationSchedule.push({
        isCompleted: isCompleted,
        isHomeGame: oleMiss.homeAway === "home",
        opposingTeam: {
          name: opponent.team.displayName,
          abbrev: opponent.team.abbreviation,
          images: {
            small: opponent.team.logos?.[0]?.href || ""
          }
        },
        date: formatDateET(event.date),
        location: isCompleted ? `Final | ${oleMiss.score?.value}-${opponent.score?.value}` : `${venueStr} | ${network}`
      });
    });

    let activeUpcoming = inspirationSchedule.filter(g => !g.isCompleted);
    let finalSchedule = activeUpcoming.length > 0 ? activeUpcoming : inspirationSchedule;

    const payload = {
      rank: currentRank,
      season: scheduleData.season?.year || CURRENT_YEAR,
      record: scheduleData.team?.record?.[0]?.displayValue || "0-0", // Year To Date record
      most_recent_game: mostRecentGame,
      next_game: nextGame,
      all_games: processedGames,
      schedule: finalSchedule,
      images: {
        default: "https://a.espncdn.com/i/teamlogos/ncaa/500/145.png"
      },
      name: "Ole Miss Rebels"
    };

    fs.writeFileSync("payload.json", JSON.stringify(payload, null, 2));
    console.log("Successfully generated payload.json");
  } catch (error) {
    console.error("Error fetching data:", error);
    process.exit(1);
  }
}

main();
