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
    return `${name}, fitness is foundation!\n\n• Interval runs: 30s sprint, 30s jog, 10x\n• Hydrate constantly\n• Sleep 8+ hours\n\nHow's your recovery?`;
  }
  if (skills.mental) {
    if (/nervous|anxiety/i.test(message)) {
      return `${name}, nerves mean you care 💙\n\n• Breathe: 4 sec in, 6 sec out\n• Say: "I've trained for this"\n• Focus on ONE thing\n\nWhat situation makes you most nervous?`;
    }
    return `${name}, mental strength wins games.\n\n• Process > outcome\n• Celebrate small wins\n• Track progress\n\nWhat's your biggest mental challenge?`;
  }

  // Position-specific
  if (/goalkeeper|gk/i.test(message) || position === 'gk') {
    if (/diving|save/i.test(message)) {
      return `${name}, diving technique:\n\n1. Push off near foot\n2. Hands lead\n3. Land on forearm + side\n\nWhat scares you about diving?`;
    }
    if (/handling|catch/i.test(message)) {
      return `${name}, handling = confidence!\n\n• W-grip behind ball\n• Cushion to chest\n• Watch it all the way\n\nWhich shot type troubles you?`;
    }
    return `${name}, GKs are warriors! What needs work: diving, handling, distribution, or positioning?`;
  }

  if (/striker|st|forward/i.test(message) || position === 'st') {
    if (/finish|shoot/i.test(message)) {
      return `${name}, finishing = composure.\n\nDrill: Friend calls direction, turn & shoot in 2 sec, 10 reps.\n\nKey: Pick spot BEFORE shooting. Where do you miss?`;
    }
    if (/movement|run/i.test(message)) {
      return `${name}, movement creates chances!\n\n• Run away, then spin back\n• Time runs with passer's head up\n• Watch last defender's shoulder\n\nStudy Osimhen!`;
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
    return `That's HUGE, ${name}! 🙌 Consistency beats talent. Keep showing up!`;
  }

  // Vague input
  if (/struggling|hard|difficult|can't|bad at/i.test(message)) {
    return `I'm here, ${name}! To help best:\n\n• Your position?\n• What specifically feels tough?\n• How long working on it?\n\nNo judgment—just solutions!`;
  }

  // Analyze player progress from conversation
  const hasImproved = /better|improved|progress|easier/i.test(message);
  if (hasImproved) {
    return `${name}, that's AMAZING progress! 🎉\n\nKeep building on this momentum. What's your next goal?`;
  }

  // Detect frustration
  const isFrustrated = /frustrated|annoyed|giving up|quit|hate/i.test(message);
  if (isFrustrated) {
    return `${name}, I hear you. Every pro has been where you are.\n\n• Take a 10-min break\n• Try a different drill\n• Remember why you started\n\nWhat's making you feel this way?`;
  }

  // Injury detection
  const hasInjury = /hurt|pain|injured|sore|sprain|strain/i.test(message);
  if (hasInjury) {
    return `${name}, your health comes FIRST! 🚨\n\n• Rest immediately\n• Ice + elevate\n• See a doctor if severe\n\nDon't train through pain. What hurts?`;
  }

  // Match preparation
  const hasMatch = /match|game|tournament|competition/i.test(message);
  if (hasMatch) {
    if (/tomorrow|today|soon/i.test(message)) {
      return `${name}, match day prep:\n\n• Hydrate NOW (2L water)\n• Light stretching only\n• Visualize success\n• Sleep 8+ hours\n• Eat carbs 3hrs before\n\nYou've trained for this!`;
    }
    return `${name}, match prep checklist:\n\n• Review opponent weaknesses\n• Practice set pieces\n• Mental rehearsal\n• Check your gear\n\nWhen's the match?`;
  }

  // Training plan request
  const wantsPlan = /plan|program|schedule|routine|week/i.test(message);
  if (wantsPlan) {
    return `${name}, let's build your plan! Tell me:\n\n• Your position?\n• Days available per week?\n• Current weaknesses?\n• Match schedule?\n\nI'll create a custom program!`;
  }

  // Nutrition questions
  const aboutNutrition = /eat|food|diet|nutrition|meal|protein/i.test(message);
  if (aboutNutrition) {
    return `${name}, fuel = performance!\n\n• Pre-training: Banana + water (30min before)\n• Post-training: Protein + carbs (within 30min)\n• Daily: 2-3L water, lean protein, veggies\n• Avoid: Junk food 24hrs before matches\n\nWhat's your current diet like?`;
  }

  // Teammate/coach issues
  const socialIssue = /teammate|coach|team|conflict|argument/i.test(message);
  if (socialIssue) {
    return `${name}, team dynamics matter.\n\n• Communicate calmly\n• Focus on solutions, not blame\n• Lead by example\n• Respect differences\n\nWhat's the situation?`;
  }

  // Weather/environment adaptation
  const weatherIssue = /rain|cold|hot|weather|indoor|outdoor/i.test(message);
  if (weatherIssue) {
    if (/rain|wet/i.test(message)) {
      return `${name}, rainy day training:\n\n• Shorter studs for grip\n• First touch crucial (slippery ball)\n• Low passes > high balls\n• Stay warm, dry off fast\n\nWhat's your main challenge in rain?`;
    }
    if (/hot|heat/i.test(message)) {
      return `${name}, heat management:\n\n• Hydrate 2hrs before\n• Train early morning/evening\n• Wear light colors\n• Take water breaks every 15min\n\nHow hot is it where you are?`;
    }
    return `${name}, adapt to conditions! What weather are you dealing with?`;
  }

  // Equipment/gear questions
  const gearQuestion = /boots|shoes|cleats|ball|shin guards|gloves/i.test(message);
  if (gearQuestion) {
    if (/boots|shoes|cleats/i.test(message)) {
      return `${name}, boot selection:\n\n• Firm ground (FG): Most surfaces\n• Soft ground (SG): Wet/muddy\n• Turf (TF): Artificial grass\n• Fit: Snug but not tight\n\nWhat surface do you play on most?`;
    }
    if (/ball/i.test(message)) {
      return `${name}, ball choice:\n\n• Size 5: Age 13+\n• Size 4: Age 8-12\n• Size 3: Under 8\n• Practice with match ball weight\n\nWhat's your age?`;
    }
    return `${name}, gear matters! What equipment do you need help with?`;
  }

  // Video analysis request
  const wantsVideo = /video|watch|analyze|film|record/i.test(message);
  if (wantsVideo) {
    return `${name}, video analysis is GOLD! 📹\n\n• Record your training\n• Watch in slow-mo\n• Compare to pros\n• Note 3 things to improve\n\nWhat skill do you want to film?`;
  }

  // Motivation/inspiration
  const needsMotivation = /motivation|inspire|why|purpose|goal/i.test(message);
  if (needsMotivation) {
    return `${name}, remember your WHY! 🔥\n\n• Write down your dream\n• Visualize success daily\n• Track small wins\n• Watch your heroes\n\nWhat's your biggest football dream?`;
  }

  // Parent/guardian questions
  const parentQuestion = /parent|dad|mom|family|support/i.test(message);
  if (parentQuestion) {
    return `${name}, family support is huge!\n\n• Show them your progress\n• Invite them to watch\n• Share your goals\n• Ask for specific help\n\nHow can they support you better?`;
  }

  // Time management
  const timeIssue = /time|busy|school|homework|balance/i.test(message);
  if (timeIssue) {
    return `${name}, smart scheduling:\n\n• 30min focused > 2hrs unfocused\n• Train before school (energy boost)\n• Weekend = longer sessions\n• Homework first, then train\n\nHow many hours can you train weekly?`;
  }

  // Comparison to others
  const comparing = /better than|worse than|compare|other players/i.test(message);
  if (comparing) {
    return `${name}, compete with YESTERDAY'S you! 💯\n\n• Everyone's journey is different\n• Focus on YOUR growth\n• Learn from others, don't copy\n• Your unique style = your strength\n\nWhat's YOUR best skill?`;
  }

  // Recovery questions
  const recoveryQuestion = /rest|recovery|sore|tired|sleep/i.test(message);
  if (recoveryQuestion) {
    return `${name}, recovery = growth!\n\n• Sleep 8-10hrs (teens need more)\n• Stretch 10min post-training\n• Ice sore muscles\n• 1-2 rest days per week\n\nHow many hours do you sleep?`;
  }

  // Age-specific advice
  const age = userContext.age || 0;
  if (age > 0 && age < 12) {
    return `${name}, at your age, focus on FUN! 🎮\n\n• Play different positions\n• Try new skills\n• Don't worry about mistakes\n• Enjoy the game!\n\nWhat do you love most about football?`;
  }
  if (age >= 12 && age < 16) {
    return `${name}, development years! 💪\n\n• Master fundamentals\n• Build good habits\n• Train weak foot\n• Study pro players\n\nWhat position interests you most?`;
  }
  if (age >= 16) {
    return `${name}, time to specialize!\n\n• Perfect your position\n• Tactical awareness\n• Physical conditioning\n• Mental toughness\n\nWhat's your main position?`;
  }

  // Pro player comparisons
  const proMention = /messi|ronaldo|neymar|mbappe|haaland|salah|osimhen|kante|modric/i.test(message);
  if (proMention) {
    const player = message.match(/messi|ronaldo|neymar|mbappe|haaland|salah|osimhen|kante|modric/i)?.[0];
    return `${name}, studying ${player}? Smart!\n\n• Watch their off-ball movement\n• Note their body positioning\n• Copy ONE signature move\n• Adapt to YOUR strengths\n\nWhat specific skill of theirs do you want?`;
  }

  // Tryout/trial preparation
  const tryoutMention = /tryout|trial|audition|scout|academy/i.test(message);
  if (tryoutMention) {
    return `${name}, tryout prep checklist:\n\n• Train your best position\n• Show work rate (coaches notice!)\n• Communicate loudly\n• Stay positive if mistakes happen\n• Bring water + extra gear\n\nWhen's your tryout?`;
  }

  // Set piece training
  const setPiece = /corner|free kick|penalty|throw in|set piece/i.test(message);
  if (setPiece) {
    if (/penalty/i.test(message)) {
      return `${name}, penalty mastery:\n\n• Pick your spot BEFORE stepping up\n• Don't change mind mid-run\n• Strike with laces, not toe\n• Practice under pressure\n\nWhat's your penalty routine?`;
    }
    if (/free kick/i.test(message)) {
      return `${name}, free kick technique:\n\n• Plant foot beside ball\n• Strike top half for dip\n• Follow through to target\n• Practice from same spots\n\nWhat distance are you practicing?`;
    }
    return `${name}, set pieces win games! Which one: corners, free kicks, or penalties?`;
  }

  // Language/communication on field
  const commIssue = /communicate|talk|shout|language|call/i.test(message);
  if (commIssue) {
    return `${name}, communication = leadership!\n\n• Call names: "John, man on!"\n• Be loud but clear\n• Encourage teammates\n• Use simple words\n\nWhat position do you play?`;
  }

  // Speed/pace training
  const speedWork = /speed|fast|quick|pace|sprint/i.test(message);
  if (speedWork && !skills.fitness) {
    return `${name}, speed training:\n\n• 20m sprints x 10 (rest 30s)\n• Ladder drills for footwork\n• Hill sprints for power\n• Plyometrics (box jumps)\n\nHow fast can you run 40m?`;
  }

  // Strength/gym work
  const strengthWork = /strength|gym|weights|muscle|strong/i.test(message);
  if (strengthWork) {
    if (age < 16) {
      return `${name}, at your age, bodyweight only!\n\n• Push-ups\n• Squats\n• Planks\n• Lunges\n\nNo weights until 16+. How old are you?`;
    }
    return `${name}, strength program:\n\n• Squats (legs)\n• Deadlifts (posterior chain)\n• Core work daily\n• 2-3x per week max\n\nDo you have gym access?`;
  }

  // Tactical awareness
  const tacticalQ = /tactics|formation|strategy|positioning|system/i.test(message);
  if (tacticalQ) {
    return `${name}, tactical intelligence:\n\n• Watch full matches (not highlights)\n• Study your position's movement\n• Understand team shape\n• Ask your coach questions\n\nWhat formation does your team play?`;
  }

  // Comeback from break
  const longBreak = /break|off season|vacation|comeback|return/i.test(message);
  if (longBreak) {
    return `${name}, returning from break:\n\n• Week 1: Light jogging + ball work\n• Week 2: Add intensity gradually\n• Week 3: Full training\n• Don't rush, avoid injury!\n\nHow long was your break?`;
  }

  // Default
  return `Hey ${name}! To give SPECIFIC advice:\n\n• Your position?\n• What skill needs work?\n• Your biggest frustration?\n\nMore detail = better help!`;
};
