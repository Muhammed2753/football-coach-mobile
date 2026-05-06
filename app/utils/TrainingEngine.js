// app/utils/TrainingEngine.js
/**
 * Training Progression System
 * Calculates training impact, estimates goal timelines, and generates training plans
 */

// Base weekly improvement rate (varies by attribute and current level)
const getImprovementRate = (currentValue, targetValue, intensity) => {
  const gap = targetValue - currentValue;
  if (gap <= 0) return 0;
  
  // Harder to improve at higher values (diminishing returns)
  const difficulty = currentValue / 99;
  const baseRate = (1 - difficulty) * intensity;
  
  return Math.max(0.5, baseRate); // minimum 0.5 per week
};

/**
 * Calculate progress after X weeks of training
 */
export const calculateProgress = (currentValue, weeks, intensity = 1) => {
  const rate = getImprovementRate(currentValue, 99, intensity);
  const improved = currentValue + (rate * weeks);
  return Math.min(Math.round(improved), 99);
};

/**
 * Estimate weeks needed to reach a target value
 */
export const estimateWeeksToGoal = (currentValue, targetValue, intensity = 1) => {
  if (targetValue <= currentValue) return 0;
  
  const gap = targetValue - currentValue;
  const difficulty = currentValue / 99;
  const baseRate = (1 - difficulty) * intensity;
  const rate = Math.max(0.5, baseRate);
  
  return Math.ceil(gap / rate);
};

/**
 * Create a training plan targeting specific weaknesses
 */
export const createTrainingPlan = (playerAttrs, weaknesses, intensity = 'moderate') => {
  const intensityMap = {
    light: 0.5,
    moderate: 1,
    intense: 1.5,
    extreme: 2,
  };
  
  const intensityValue = intensityMap[intensity] || 1;
  
  // Sort weaknesses by value (lowest first)
  const sorted = [...weaknesses].sort((a, b) => a.value - b.value);
  
  const plan = {
    name: `${intensity.charAt(0).toUpperCase() + intensity.slice(1)} Training Plan`,
    intensity,
    startDate: new Date().toISOString(),
    focus: sorted.slice(0, 3), // Focus on top 3 weaknesses
    schedule: [],
    estimatedGains: {},
  };
  
  // Generate 12-week plan
  const weeks = 12;
  for (let i = 1; i <= weeks; i++) {
    const weekPlan = {
      week: i,
      focus: sorted[i % sorted.length],
      session: generateWeeklySession(sorted[i % sorted.length], intensityValue),
    };
    plan.schedule.push(weekPlan);
  }
  
  // Calculate estimated gains after 12 weeks
  sorted.forEach(({ key, value }) => {
    const newValue = calculateProgress(value, weeks, intensityValue);
    plan.estimatedGains[key] = {
      from: value,
      to: newValue,
      gain: newValue - value,
    };
  });
  
  return plan;
};

/**
 * Generate weekly training session details
 */
const generateWeeklySession = (weakness, intensity) => {
  const sessions = {
    diving: {
      exercises: [
        'Diving technique drills (7mlc style)',
        'Reflex diving with tennis balls', 
        'Positioning and angle work',
        'Recovery and second save practice'
      ],
      duration: `${45 * intensity} mins`,
      reps: Math.ceil(3 * intensity),
      youtubeChannels: ['7mlc', 'ZTH Training', 'Joner Football'],
      tips: 'Focus on footwork before diving. Lead with hands, not body.'
    },
    handling: {
      exercises: [
        'W-grip catching drills',
        'High ball collection under pressure',
        'One-handed saves and parrying',
        'Distribution after saves'
      ],
      duration: `${45 * intensity} mins`,
      reps: Math.ceil(3 * intensity),
      youtubeChannels: ['Joner Football', 'The Modern Goalkeeper'],
      tips: 'Soft hands, watch the ball into your chest, secure before distributing.'
    },
    kicking: {
      exercises: [
        'Goal kicks for accuracy and distance',
        'Quick distribution throws',
        'Footwork and kicking technique',
        'Under pressure distribution'
      ],
      duration: `${40 * intensity} mins`,
      reps: Math.ceil(2 * intensity),
      youtubeChannels: ['All Attack', 'Unisport'],
      tips: 'Accuracy over power. Pick your target before kicking.'
    },
    positioning: {
      exercises: [
        'Angle narrowing drills',
        'Communication with defense',
        'Reading the game situations',
        'Coming off the line timing'
      ],
      duration: `${50 * intensity} mins`,
      reps: Math.ceil(3 * intensity),
      youtubeChannels: ['ZTH Training', 'Football Protocol'],
      tips: 'Stay central, communicate constantly, trust your instincts.'
    },
    reflexes: {
      exercises: [
        'Reaction ball training',
        'Multiple ball saves',
        'Close-range shot stopping',
        'Agility ladder for quick feet'
      ],
      duration: `${40 * intensity} mins`,
      reps: Math.ceil(4 * intensity),
      youtubeChannels: ['7mlc', 'The Modern Goalkeeper'],
      tips: 'Stay relaxed, react naturally, trust your training.'
    },
    acceleration: {
      exercises: ['Sprint starts', 'Explosive power', 'Agility ladder'],
      duration: `${50 * intensity} mins`,
      reps: Math.ceil(3 * intensity),
    },
    sprintSpeed: {
      exercises: ['High-speed sprints', 'Distance running', 'Interval training'],
      duration: `${55 * intensity} mins`,
      reps: Math.ceil(3 * intensity),
    },
    finishing: {
      exercises: ['1v1 shooting', 'Clinical finishing', 'Set pieces'],
      duration: `${50 * intensity} mins`,
      reps: Math.ceil(4 * intensity),
    },
    crossing: {
      exercises: ['Cross accuracy', 'Deep balls', 'Low crosses'],
      duration: `${45 * intensity} mins`,
      reps: Math.ceil(3 * intensity),
    },
    dribbling: {
      exercises: ['Cone drills', 'Ball control', 'Change of pace'],
      duration: `${50 * intensity} mins`,
      reps: Math.ceil(3 * intensity),
    },
    marking: {
      exercises: ['Man-marking drills', 'Positioning', 'Anticipation'],
      duration: `${45 * intensity} mins`,
      reps: Math.ceil(3 * intensity),
    },
    strength: {
      exercises: ['Resistance training', 'Core work', 'Balance exercises'],
      duration: `${55 * intensity} mins`,
      reps: Math.ceil(3 * intensity),
    },
  };
  
  return sessions[weakness?.key] || sessions.dribbling;
};

/**
 * Track training session completion
 */
export const logTrainingSession = (playerId, week, attribute, difficulty, completed) => {
  return {
    playerId,
    date: new Date().toISOString(),
    week,
    attribute,
    difficulty,
    completed,
    xp: completed ? 10 + (difficulty * 5) : 0,
  };
};

/**
 * Calculate overall progress from training logs
 */
export const calculateProgressFromLogs = (initialAttrs, trainingLogs) => {
  const progressByAttr = {};
  
  Object.keys(initialAttrs).forEach(attr => {
    const logsForAttr = trainingLogs.filter(log => log.attribute === attr && log.completed);
    const weeks = logsForAttr.length;
    const avgDifficulty = logsForAttr.length > 0 
      ? logsForAttr.reduce((sum, log) => sum + log.difficulty, 0) / logsForAttr.length
      : 1;
    
    const newValue = calculateProgress(initialAttrs[attr], weeks, avgDifficulty);
    progressByAttr[attr] = {
      initial: initialAttrs[attr],
      current: newValue,
      improvement: newValue - initialAttrs[attr],
      weeks,
    };
  });
  
  return progressByAttr;
};

/**
 * Get recommended training intensity based on age and current level
 */
export const recommendIntensity = (age, overall) => {
  if (age < 16) return 'light'; // Young players need lighter training
  if (age < 23) return 'moderate'; // Development years
  if (age < 32) return 'intense'; // Prime years
  return 'moderate'; // Older players recover slower
};

/**
 * Milestone achievements
 */
export const checkMilestones = (playerAttrs, previousAttrs) => {
  const milestones = [];
  
  Object.keys(playerAttrs).forEach(attr => {
    const prev = previousAttrs[attr] || 0;
    const curr = playerAttrs[attr];
    
    // Check for level-up milestones
    const prevLevel = Math.floor(prev / 10) * 10;
    const currLevel = Math.floor(curr / 10) * 10;
    
    if (currLevel > prevLevel) {
      milestones.push({
        type: 'level_up',
        attribute: attr,
        oldLevel: prevLevel,
        newLevel: currLevel,
        message: `${attr} reached level ${currLevel}! ðŸŽ‰`,
      });
    }
  });
  
  return milestones;
};
