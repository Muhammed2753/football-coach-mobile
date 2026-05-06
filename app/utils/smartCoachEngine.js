// Smart context-aware coach responses with advanced features
export const generateSmartResponse = (message, conversationHistory = [], userContext = {}) => {
  // Extract player data from context
  const recentMessages = conversationHistory.slice(-6).map(m => m.text?.toLowerCase() || '');
  const fullConversation = recentMessages.join(' ');
  const msg = message.toLowerCase();
  const { name = "Champion", position, lastTopics = [] } = userContext;

  // Detect specific skills
  const skills = {
    passing: /pass|distribution|assist/i.test(message),
    shooting: /shoot|finish|goal|score/i.test(message),
    dribbling: /dribble|skill|beat|1v1/i.test(message),
    defending: /defend|tackle|mark|intercept/i.test(message),
    fitness: /stamina|tired|fitness|endurance/i.test(message),
    mental: /confidence|nervous|pressure|anxiety/i.test(message)
  };

  const detectedSkill = Object.keys(skills).find(k => skills[k]);

  // Avoid repetition
  if (detectedSkill && lastTopics.includes(detectedSkill)) {
    return `${name}, still working on ${detectedSkill}! What SPECIFICALLY feels off? More detail = better help!`;
  }

  // Skill-specific drills
  if (skills.passing) {
    return `${name}, passing = vision + technique.\n\nDrill: Wall passes, 3 yards, 20 reps each foot.\n\nKey: Lock ankle, look up first. What's your biggest passing challenge?`;
  }
  if (skills.shooting) {
    return `${name}, goals win games!\n\nDrill: 8 yards out, shoot on call (LEFT/RIGHT), 10 reps.\n\nKey: Strike THROUGH the ball. Which part needs work?`;
  }
  if (skills.dribbling) {
    return `${name}, close control = confidence!\n\nDrill: Tight circles, 30 sec each foot.\n\nKey: Small touches. What feels awkward?`;
  }
  if (skills.fitness) {
    return `${name}, fitness is foundation!\n\nâ€¢ Interval runs: 30s sprint, 30s jog, 10x\nâ€¢ Hydrate constantly\nâ€¢ Sleep 8+ hours\n\nHow's your recovery?`;
  }
  if (skills.mental) {
    if (/nervous|anxiety/i.test(message)) {
      return `${name}, nerves mean you care ðŸ’™\n\nâ€¢ Breathe: 4 sec in, 6 sec out\nâ€¢ Say: "I've trained for this"\nâ€¢ Focus on ONE thing\n\nWhat situation makes you most nervous?`;
    }
    return `${name}, mental strength wins games.\n\nâ€¢ Process > outcome\nâ€¢ Celebrate small wins\nâ€¢ Track progress\n\nWhat's your biggest mental challenge?`;
  }

  // Position-specific
  if (/goalkeeper|gk/i.test(message) || position === 'gk') {
    if (/diving|save/i.test(message)) {
      return `${name}, diving technique:\n\n1. Push off near foot\n2. Hands lead\n3. Land on forearm + side\n\nWhat scares you about diving?`;
    }
    if (/handling|catch/i.test(message)) {
      return `${name}, handling = confidence!\n\nâ€¢ W-grip behind ball\nâ€¢ Cushion to chest\nâ€¢ Watch it all the way\n\nWhich shot type troubles you?`;
    }
    return `${name}, GKs are warriors! What needs work: diving, handling, distribution, or positioning?`;
  }

  if (/striker|st|forward/i.test(message) || position === 'st') {
    if (/finish|shoot/i.test(message)) {
      return `${name}, finishing = composure.\n\nDrill: Friend calls direction, turn & shoot in 2 sec, 10 reps.\n\nKey: Pick spot BEFORE shooting. Where do you miss?`;
    }
    if (/movement|run/i.test(message)) {
      return `${name}, movement creates chances!\n\nâ€¢ Run away, then spin back\nâ€¢ Time runs with passer's head up\nâ€¢ Watch last defender's shoulder\n\nStudy Osimhen!`;
    }
    return `${name}, strikers win games! What's tough: finishing, movement, or hold-up play?`;
  }

  if (/midfielder|cm|cdm|cam/i.test(message) || ['cm', 'cdm', 'cam'].includes(position)) {
    if (/pass/i.test(message)) {
      return `${name}, CMs control with passing.\n\nDrill: Wall passes, scan before receiving, 50 reps.\n\nKey: Head up. What pass type troubles you?`;
    }
    return `${name}, engine room! What needs work: passing, stamina, or positioning?`;
  }

  // General
  if (/first touch|control/i.test(message)) {
    return `${name}, first touch is everything!\n\nDrill: Wall passes, control in 1 touch, 50 reps.\n\nKey: Soft foot, eyes on ball. What surface troubles you?`;
  }

  if (/weak foot/i.test(message)) {
    return `${name}, weak foot challenge:\n\n1. Juggle 5x\n2. Wall passes 10x\n3. Shoot 5x\n\nDaily practice = natural feel in 2 weeks!`;
  }

  // Effort celebration
  if (/trained|practiced|did|tried|worked/i.test(message)) {
    return `That's HUGE, ${name}! ðŸ™Œ Consistency beats talent. Keep showing up!`;
  }

  // Vague input
  if (/struggling|hard|difficult|can't|bad at/i.test(message)) {
    return `I'm here, ${name}! To help best:\n\nâ€¢ Your position?\nâ€¢ What specifically feels tough?\nâ€¢ How long working on it?\n\nNo judgmentâ€”just solutions!`;
  }

  // Analyze player progress from conversation
  const hasImproved = /better|improved|progress|easier/i.test(message);
  if (hasImproved) {
    return `${name}, that's AMAZING progress! ðŸŽ‰\n\nKeep building on this momentum. What's your next goal?`;
  }

  // Detect frustration
  const isFrustrated = /frustrated|annoyed|giving up|quit|hate/i.test(message);
  if (isFrustrated) {
    return `${name}, I hear you. Every pro has been where you are.\n\nâ€¢ Take a 10-min break\nâ€¢ Try a different drill\nâ€¢ Remember why you started\n\nWhat's making you feel this way?`;
  }

  // Injury detection
  const hasInjury = /hurt|pain|injured|sore|sprain|strain/i.test(message);
  if (hasInjury) {
    return `${name}, your health comes FIRST! ðŸš¨\n\nâ€¢ Rest immediately\nâ€¢ Ice + elevate\nâ€¢ See a doctor if severe\n\nDon't train through pain. What hurts?`;
  }

  // Match preparation
  const hasMatch = /match|game|tournament|competition/i.test(message);
  if (hasMatch) {
    if (/tomorrow|today|soon/i.test(message)) {
      return `${name}, match day prep:\n\nâ€¢ Hydrate NOW (2L water)\nâ€¢ Light stretching only\nâ€¢ Visualize success\nâ€¢ Sleep 8+ hours\nâ€¢ Eat carbs 3hrs before\n\nYou've trained for this!`;
    }
    return `${name}, match prep checklist:\n\nâ€¢ Review opponent weaknesses\nâ€¢ Practice set pieces\nâ€¢ Mental rehearsal\nâ€¢ Check your gear\n\nWhen's the match?`;
  }

  // Training plan request
  const wantsPlan = /plan|program|schedule|routine|week/i.test(message);
  if (wantsPlan) {
    return `${name}, let's build your plan! Tell me:\n\nâ€¢ Your position?\nâ€¢ Days available per week?\nâ€¢ Current weaknesses?\nâ€¢ Match schedule?\n\nI'll create a custom program!`;
  }

  // Nutrition questions
  const aboutNutrition = /eat|food|diet|nutrition|meal|protein/i.test(message);
  if (aboutNutrition) {
    return `${name}, fuel = performance!\n\nâ€¢ Pre-training: Banana + water (30min before)\nâ€¢ Post-training: Protein + carbs (within 30min)\nâ€¢ Daily: 2-3L water, lean protein, veggies\nâ€¢ Avoid: Junk food 24hrs before matches\n\nWhat's your current diet like?`;
  }

  // Teammate/coach issues
  const socialIssue = /teammate|coach|team|conflict|argument/i.test(message);
  if (socialIssue) {
    return `${name}, team dynamics matter.\n\nâ€¢ Communicate calmly\nâ€¢ Focus on solutions, not blame\nâ€¢ Lead by example\nâ€¢ Respect differences\n\nWhat's the situation?`;
  }

  // Weather/environment adaptation
  const weatherIssue = /rain|cold|hot|weather|indoor|outdoor/i.test(message);
  if (weatherIssue) {
    if (/rain|wet/i.test(message)) {
      return `${name}, rainy day training:\n\nâ€¢ Shorter studs for grip\nâ€¢ First touch crucial (slippery ball)\nâ€¢ Low passes > high balls\nâ€¢ Stay warm, dry off fast\n\nWhat's your main challenge in rain?`;
    }
    if (/hot|heat/i.test(message)) {
      return `${name}, heat management:\n\nâ€¢ Hydrate 2hrs before\nâ€¢ Train early morning/evening\nâ€¢ Wear light colors\nâ€¢ Take water breaks every 15min\n\nHow hot is it where you are?`;
    }
    return `${name}, adapt to conditions! What weather are you dealing with?`;
  }

  // Equipment/gear questions
  const gearQuestion = /boots|shoes|cleats|ball|shin guards|gloves/i.test(message);
  if (gearQuestion) {
    if (/boots|shoes|cleats/i.test(message)) {
      return `${name}, boot selection:\n\nâ€¢ Firm ground (FG): Most surfaces\nâ€¢ Soft ground (SG): Wet/muddy\nâ€¢ Turf (TF): Artificial grass\nâ€¢ Fit: Snug but not tight\n\nWhat surface do you play on most?`;
    }
    if (/ball/i.test(message)) {
      return `${name}, ball choice:\n\nâ€¢ Size 5: Age 13+\nâ€¢ Size 4: Age 8-12\nâ€¢ Size 3: Under 8\nâ€¢ Practice with match ball weight\n\nWhat's your age?`;
    }
    return `${name}, gear matters! What equipment do you need help with?`;
  }

  // Video analysis request
  const wantsVideo = /video|watch|analyze|film|record/i.test(message);
  if (wantsVideo) {
    return `${name}, video analysis is GOLD! ðŸ“¹\n\nâ€¢ Record your training\nâ€¢ Watch in slow-mo\nâ€¢ Compare to pros\nâ€¢ Note 3 things to improve\n\nWhat skill do you want to film?`;
  }

  // Motivation/inspiration
  const needsMotivation = /motivation|inspire|why|purpose|goal/i.test(message);
  if (needsMotivation) {
    return `${name}, remember your WHY! ðŸ”¥\n\nâ€¢ Write down your dream\nâ€¢ Visualize success daily\nâ€¢ Track small wins\nâ€¢ Watch your heroes\n\nWhat's your biggest football dream?`;
  }

  // Parent/guardian questions
  const parentQuestion = /parent|dad|mom|family|support/i.test(message);
  if (parentQuestion) {
    return `${name}, family support is huge!\n\nâ€¢ Show them your progress\nâ€¢ Invite them to watch\nâ€¢ Share your goals\nâ€¢ Ask for specific help\n\nHow can they support you better?`;
  }

  // Time management
  const timeIssue = /time|busy|school|homework|balance/i.test(message);
  if (timeIssue) {
    return `${name}, smart scheduling:\n\nâ€¢ 30min focused > 2hrs unfocused\nâ€¢ Train before school (energy boost)\nâ€¢ Weekend = longer sessions\nâ€¢ Homework first, then train\n\nHow many hours can you train weekly?`;
  }

  // Comparison to others
  const comparing = /better than|worse than|compare|other players/i.test(message);
  if (comparing) {
    return `${name}, compete with YESTERDAY'S you! ðŸ’¯\n\nâ€¢ Everyone's journey is different\nâ€¢ Focus on YOUR growth\nâ€¢ Learn from others, don't copy\nâ€¢ Your unique style = your strength\n\nWhat's YOUR best skill?`;
  }

  // Recovery questions
  const recoveryQuestion = /rest|recovery|sore|tired|sleep/i.test(message);
  if (recoveryQuestion) {
    return `${name}, recovery = growth!\n\nâ€¢ Sleep 8-10hrs (teens need more)\nâ€¢ Stretch 10min post-training\nâ€¢ Ice sore muscles\nâ€¢ 1-2 rest days per week\n\nHow many hours do you sleep?`;
  }

  // Age-specific advice
  const age = userContext.age || 0;
  if (age > 0 && age < 12) {
    return `${name}, at your age, focus on FUN! ðŸŽ®\n\nâ€¢ Play different positions\nâ€¢ Try new skills\nâ€¢ Don't worry about mistakes\nâ€¢ Enjoy the game!\n\nWhat do you love most about football?`;
  }
  if (age >= 12 && age < 16) {
    return `${name}, development years! ðŸ’ª\n\nâ€¢ Master fundamentals\nâ€¢ Build good habits\nâ€¢ Train weak foot\nâ€¢ Study pro players\n\nWhat position interests you most?`;
  }
  if (age >= 16) {
    return `${name}, time to specialize!\n\nâ€¢ Perfect your position\nâ€¢ Tactical awareness\nâ€¢ Physical conditioning\nâ€¢ Mental toughness\n\nWhat's your main position?`;
  }

  // Pro player comparisons
  const proMention = /messi|ronaldo|neymar|mbappe|haaland|salah|osimhen|kante|modric/i.test(message);
  if (proMention) {
    const player = message.match(/messi|ronaldo|neymar|mbappe|haaland|salah|osimhen|kante|modric/i)?.[0];
    return `${name}, studying ${player}? Smart!\n\nâ€¢ Watch their off-ball movement\nâ€¢ Note their body positioning\nâ€¢ Copy ONE signature move\nâ€¢ Adapt to YOUR strengths\n\nWhat specific skill of theirs do you want?`;
  }

  // Tryout/trial preparation
  const tryoutMention = /tryout|trial|audition|scout|academy/i.test(message);
  if (tryoutMention) {
    return `${name}, tryout prep checklist:\n\nâ€¢ Train your best position\nâ€¢ Show work rate (coaches notice!)\nâ€¢ Communicate loudly\nâ€¢ Stay positive if mistakes happen\nâ€¢ Bring water + extra gear\n\nWhen's your tryout?`;
  }

  // Set piece training
  const setPiece = /corner|free kick|penalty|throw in|set piece/i.test(message);
  if (setPiece) {
    if (/penalty/i.test(message)) {
      return `${name}, penalty mastery:\n\nâ€¢ Pick your spot BEFORE stepping up\nâ€¢ Don't change mind mid-run\nâ€¢ Strike with laces, not toe\nâ€¢ Practice under pressure\n\nWhat's your penalty routine?`;
    }
    if (/free kick/i.test(message)) {
      return `${name}, free kick technique:\n\nâ€¢ Plant foot beside ball\nâ€¢ Strike top half for dip\nâ€¢ Follow through to target\nâ€¢ Practice from same spots\n\nWhat distance are you practicing?`;
    }
    return `${name}, set pieces win games! Which one: corners, free kicks, or penalties?`;
  }

  // Language/communication on field
  const commIssue = /communicate|talk|shout|language|call/i.test(message);
  if (commIssue) {
    return `${name}, communication = leadership!\n\nâ€¢ Call names: "John, man on!"\nâ€¢ Be loud but clear\nâ€¢ Encourage teammates\nâ€¢ Use simple words\n\nWhat position do you play?`;
  }

  // Speed/pace training
  const speedWork = /speed|fast|quick|pace|sprint/i.test(message);
  if (speedWork && !skills.fitness) {
    return `${name}, speed training:\n\nâ€¢ 20m sprints x 10 (rest 30s)\nâ€¢ Ladder drills for footwork\nâ€¢ Hill sprints for power\nâ€¢ Plyometrics (box jumps)\n\nHow fast can you run 40m?`;
  }

  // Strength/gym work
  const strengthWork = /strength|gym|weights|muscle|strong/i.test(message);
  if (strengthWork) {
    if (age < 16) {
      return `${name}, at your age, bodyweight only!\n\nâ€¢ Push-ups\nâ€¢ Squats\nâ€¢ Planks\nâ€¢ Lunges\n\nNo weights until 16+. How old are you?`;
    }
    return `${name}, strength program:\n\nâ€¢ Squats (legs)\nâ€¢ Deadlifts (posterior chain)\nâ€¢ Core work daily\nâ€¢ 2-3x per week max\n\nDo you have gym access?`;
  }

  // Tactical awareness
  const tacticalQ = /tactics|formation|strategy|positioning|system/i.test(message);
  if (tacticalQ) {
    return `${name}, tactical intelligence:\n\nâ€¢ Watch full matches (not highlights)\nâ€¢ Study your position's movement\nâ€¢ Understand team shape\nâ€¢ Ask your coach questions\n\nWhat formation does your team play?`;
  }

  // Comeback from break
  const longBreak = /break|off season|vacation|comeback|return/i.test(message);
  if (longBreak) {
    return `${name}, returning from break:\n\nâ€¢ Week 1: Light jogging + ball work\nâ€¢ Week 2: Add intensity gradually\nâ€¢ Week 3: Full training\nâ€¢ Don't rush, avoid injury!\n\nHow long was your break?`;
  }

  // Default
  return `Hey ${name}! To give SPECIFIC advice:\n\nâ€¢ Your position?\nâ€¢ What skill needs work?\nâ€¢ Your biggest frustration?\n\nMore detail = better help!`;
};
