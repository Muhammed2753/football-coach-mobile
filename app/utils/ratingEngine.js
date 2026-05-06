// utils/ratingEngine.js
export const getMaxRatingByAge = (age) => {
  if (age >= 4 && age <= 10) return 80;
  if (age >= 11 && age <= 14) return 83;
  if (age >= 15 && age <= 17) return 86;
  if (age >= 18 && age <= 28) return 91; // prime
  if (age >= 29 && age <= 35) return 88;
  if (age >= 36 && age <= 45) return 84;
  if (age >= 46 && age <= 56) return 80;
  return 70;
};

// Max stat for ANY individual attribute based on age
export const getMaxStatByAge = (age) => {
  if (age >= 4 && age <= 10) return 50;
  if (age >= 11 && age <= 14) return 65;
  if (age >= 15 && age <= 17) return 80;
  if (age >= 18 && age <= 28) return 99; // prime - can reach 99
  if (age >= 29 && age <= 35) return 95;
  if (age >= 36 && age <= 45) return 85;
  if (age >= 46 && age <= 56) return 75;
  return 60;
};

const safeAttr = (val) => Math.max(1, Math.min(99, Number(val) || 1));

// âœ… Detect Goalkeeper
export const isGoalkeeper = (attrs) => {
  return (attrs.reflexes || 0) > 60 && (attrs.handling || 0) > 60;
};

// âœ… Calculate Overall Rating
export const calculateOverall = (attrs, age, options = {}) => {
  let overall;

  if (isGoalkeeper(attrs)) {
    const gk = {
      diving: safeAttr(attrs.diving),
      handling: safeAttr(attrs.handling),
      kicking: safeAttr(attrs.kicking),
      positioning: safeAttr(attrs.positioning),
      reflexes: safeAttr(attrs.reflexes),
      speed: safeAttr(attrs.sprintSpeed),
    };
    overall = Math.round(
      gk.diving * 0.2 +
      gk.handling * 0.2 +
      gk.kicking * 0.15 +
      gk.positioning * 0.15 +
      gk.reflexes * 0.2 +
      gk.speed * 0.1
    );
  } else {
    const a = {
      pac: Math.round((safeAttr(attrs.acceleration) + safeAttr(attrs.sprintSpeed)) / 2),
      sho: Math.round((safeAttr(attrs.finishing) + safeAttr(attrs.shotPower) + safeAttr(attrs.longShots) + safeAttr(attrs.volleys) + safeAttr(attrs.penalties)) / 5),
      pas: Math.round((safeAttr(attrs.vision) + safeAttr(attrs.crossing) + safeAttr(attrs.shortPassing) + safeAttr(attrs.longPassing) + safeAttr(attrs.curve)) / 5),
      dri: Math.round((safeAttr(attrs.agility) + safeAttr(attrs.balance) + safeAttr(attrs.reactions) + safeAttr(attrs.ballControl) + safeAttr(attrs.dribbling) + safeAttr(attrs.composure)) / 6),
      def: Math.round((safeAttr(attrs.interceptions) + safeAttr(attrs.headingAccuracy) + safeAttr(attrs.marking) + safeAttr(attrs.standingTackle) + safeAttr(attrs.slidingTackle)) / 5),
      phy: Math.round((safeAttr(attrs.jumping) + safeAttr(attrs.stamina) + safeAttr(attrs.strength) + safeAttr(attrs.aggression)) / 4),
    };
    overall = Math.round(
      a.pac * 0.12 + a.sho * 0.13 + a.pas * 0.13 + a.dri * 0.13 + a.def * 0.14 + a.phy * 0.1
    );
  }

  if (options.disability) overall = Math.max(1, overall - 8);
  if (options.mentalStress) overall = Math.max(1, overall - 5);

  return Math.min(overall, getMaxRatingByAge(age));
};

// âœ… Recommend Position - PRIMARY first, then ALTERNATES
export const recommendPosition = (attrs, age, preferredFoot) => {
  if (isGoalkeeper(attrs)) {
    return ["GK"];
  }

  const a = {
    pac: (safeAttr(attrs.acceleration) + safeAttr(attrs.sprintSpeed)) / 2,
    sho: (safeAttr(attrs.finishing) + safeAttr(attrs.shotPower) + safeAttr(attrs.longShots) + safeAttr(attrs.volleys) + safeAttr(attrs.penalties)) / 5,
    pas: (safeAttr(attrs.vision) + safeAttr(attrs.crossing) + safeAttr(attrs.shortPassing) + safeAttr(attrs.longPassing) + safeAttr(attrs.curve)) / 5,
    dri: (safeAttr(attrs.agility) + safeAttr(attrs.balance) + safeAttr(attrs.reactions) + safeAttr(attrs.ballControl) + safeAttr(attrs.dribbling) + safeAttr(attrs.composure)) / 6,
    def: (safeAttr(attrs.interceptions) + safeAttr(attrs.headingAccuracy) + safeAttr(attrs.marking) + safeAttr(attrs.standingTackle) + safeAttr(attrs.slidingTackle)) / 5,
    phy: (safeAttr(attrs.jumping) + safeAttr(attrs.stamina) + safeAttr(attrs.strength) + safeAttr(attrs.aggression)) / 4,
    cross: safeAttr(attrs.crossing),
  };

  let primaryPos = null;
  const alternates = [];

  // PRIORITIZE PRIMARY POSITION (check in order)
  
  // Striker - Top priority for strikers
  if (a.sho >= 55 && safeAttr(attrs.finishing) >= 50) {
    primaryPos = "ST";
  }
  // Attacking Midfielder
  else if (a.pas >= 55 && a.dri >= 55 && a.sho >= 50) {
    primaryPos = "CAM";
  }
  // Wingers
  else if (a.pac >= 65 && a.dri >= 60) {
    primaryPos = preferredFoot === "Right" ? "RW" : "LW";
  }
  // Center Back
  else if (a.def >= 55 && a.pac <= 55 && a.phy >= 50) {
    primaryPos = "CB";
  }
  // Defensive Midfielder
  else if (a.def >= 50 && a.pas >= 50 && a.pac <= 60) {
    primaryPos = "CDM";
  }
  // Central Midfielder
  else if (a.pas >= 55 && a.dri >= 50 && a.def >= 40) {
    primaryPos = "CM";
  }
  // Wing Backs
  else if (a.def >= 40 && a.pac >= 65 && a.cross >= 55 && a.sho >= 40) {
    primaryPos = preferredFoot === "Right" ? "RWB" : "LWB";
  }
  // Full Backs
  else if (a.def >= 45 && a.pac >= 60 && a.cross >= 50) {
    primaryPos = preferredFoot === "Right" ? "RB" : "LB";
  }
  else {
    primaryPos = "Utility";
  }

  // NOW COLLECT ALTERNATES (don't repeat primary)
  
  // Full Backs
  if (primaryPos !== "RB" && primaryPos !== "LB" && a.def >= 45 && a.pac >= 60 && a.cross >= 50) {
    alternates.push(preferredFoot === "Right" ? "RB" : "LB");
  }

  // Wing Backs
  if (primaryPos !== "RWB" && primaryPos !== "LWB" && a.def >= 40 && a.pac >= 65 && a.cross >= 55 && a.sho >= 40) {
    alternates.push(preferredFoot === "Right" ? "RWB" : "LWB");
  }

  // Central Midfielder
  if (primaryPos !== "CM" && a.pas >= 55 && a.dri >= 50 && a.def >= 40) {
    alternates.push("CM");
  }

  // Return: PRIMARY + max 2 ALTERNATES
  return [primaryPos, ...alternates.slice(0, 2)];
};

// âœ… Drills for ALL positions (including RB, LB, RWB, LWB)
export const getImprovementTips = (positions, attrs, options = {}) => {
  const tips = [];
  const top = positions[0];

  if (top === "GK") {
    tips.push("ðŸŽ¯ GK Drills:");
    tips.push("â€¢ Reaction Saves: Use rebounder wall or reaction balls.");
    tips.push("â€¢ Distribution Accuracy: Practice punts & throws to targets at 30mâ€“50m.");
    tips.push("â€¢ 1v1 Breakaways: Simulate attackers running at you.");
  } else if (top === "CB") {
    tips.push("ðŸ›¡ï¸ CB Drills:");
    tips.push("â€¢ Aerial Duels: Win headers from crosses.");
    tips.push("â€¢ 1v1 Defending: Jockey and tackle in confined space.");
    tips.push("â€¢ Passing Under Pressure: Distribute accurately while pressed.");
  } else if (["RB", "LB"].includes(top)) {
    tips.push("ðŸ›¡ï¸ RB, LB Drills:");
    tips.push("â€¢ Overlap Runs: Sprint past winger and deliver crosses.");
    tips.push("â€¢ 1v1 Defending: Stop wingers cutting inside.");
    tips.push("â€¢ Recovery Runs: Track back quickly after attacking.");
  } else if (["RWB", "LWB"].includes(top)) {
    tips.push("âš¡ RWB, LWB Drills:");
    tips.push("â€¢ End-to-End Stamina: Shuttle runs with ball control.");
    tips.push("â€¢ Crossing on the Move: Deliver accurate crosses at full speed.");
    tips.push("â€¢ Defensive Transition: Immediately press after losing possession.");
  } else if (top === "CDM") {
    tips.push("ðŸ›¡ï¸ CDM Drills:");
    tips.push("â€¢ Interception Grid: Read passes and cut them in a 10x10m zone.");
    tips.push("â€¢ Long Passing Range: Hit moving targets at 25mâ€“45m.");
    tips.push("â€¢ Shielding & Turn: Receive under pressure and turn away.");
  } else if (top === "CM") {
    tips.push("âš™ï¸ CM Drills:");
    tips.push("â€¢ Rondos (Keep-Away): 5v2 possession to improve passing under pressure.");
    tips.push("â€¢ Box-to-Box Runs: Cover ground from penalty area to penalty area.");
  } else if (top === "CAM") {
    tips.push("ðŸŽ¨ CAM Drills:");
    tips.push("â€¢ Through-Ball Vision: Spot and play final passes into space.");
    tips.push("â€¢ Finishing from Distance: Shoot from 18â€“25 yards with both feet.");
  } else if (["LW", "RW"].includes(top)) {
    tips.push(`âš¡ ${top} Drills:`);
    tips.push("â€¢ 1v1 Take-Ons: Beat fullback using stepovers, cuts, feints.");
    tips.push("â€¢ Cut-Inside Shooting: Curl shots with weaker foot after cutting in.");
  } else if (top === "ST") {
    tips.push("âš½ ST Drills:");
    tips.push("â€¢ First-Time Finishing: Volley, half-volley, one-touch shots.");
    tips.push("â€¢ Blindside Runs: Make curved runs behind defense without looking.");
    tips.push("â€¢ Hold-Up Play: Shield ball and lay off to midfielders.");
  } else {
    tips.push("ðŸ”„ Utility Drills:");
    tips.push("â€¢ Identify your weakest attribute and focus there weekly.");
    tips.push("â€¢ Play small-sided games (3v3, 5v5) to develop all-round awareness.");
  }

  // Universal tips
  if (options.disability) tips.push("â™¿ Adaptive Tip: Focus on seated ball control and tactical IQ.");
  if (options.mentalStress) tips.push("ðŸ§  Wellness Tip: Practice 4-7-8 breathing before games.");

  tips.push("âœ¨ Pro Tip: Record yourself training â€” watch for posture and decision-making.");

  return tips;
};