// Position-specific analysis and recommendations
export const POSITION_ANALYSIS = {
  GK: {
    name: 'Goalkeeper',
    keyAttributes: ['diving', 'handling', 'kicking', 'positioning', 'reflexes'],
    mentalTraits: ['concentration', 'leadership', 'communication'],
    physicalFocus: ['agility', 'jumping', 'strength'],
    trainingPriority: {
      technical: 70,
      physical: 20,
      mental: 10
    },
    specificAdvice: {
      diving: 'Master the collapse dive technique. Always lead with hands, not body.',
      handling: 'Perfect your W-grip. Secure catches before distribution.',
      distribution: 'Mix short throws with long kicks. Accuracy over power.',
      positioning: 'Stay central, narrow angles, communicate constantly.',
      mentalStrength: 'Stay confident after mistakes. You control the defense.'
    }
  },
  CB: {
    name: 'Centre Back',
    keyAttributes: ['marking', 'tackling', 'heading', 'strength', 'positioning'],
    mentalTraits: ['leadership', 'concentration', 'anticipation'],
    physicalFocus: ['strength', 'jumping', 'stamina'],
    trainingPriority: {
      technical: 40,
      physical: 40,
      mental: 20
    },
    specificAdvice: {
      defending: 'Stay goal-side, force attackers wide, time your tackles.',
      heading: 'Attack the ball at highest point. Use your whole body.',
      distribution: 'Keep it simple. Look for the easy pass first.',
      positioning: 'Cover your partner, communicate with goalkeeper.',
      leadership: 'Organize the defense line. Be vocal and decisive.'
    }
  },
  LB: {
    name: 'Left Back',
    keyAttributes: ['pace', 'crossing', 'tackling', 'stamina', 'dribbling'],
    mentalTraits: ['workRate', 'positioning', 'decision'],
    physicalFocus: ['pace', 'stamina', 'agility'],
    trainingPriority: {
      technical: 50,
      physical: 35,
      mental: 15
    }
  },
  RB: {
    name: 'Right Back',
    keyAttributes: ['pace', 'crossing', 'tackling', 'stamina', 'dribbling'],
    mentalTraits: ['workRate', 'positioning', 'decision'],
    physicalFocus: ['pace', 'stamina', 'agility'],
    trainingPriority: {
      technical: 50,
      physical: 35,
      mental: 15
    }
  },
  CDM: {
    name: 'Defensive Midfielder',
    keyAttributes: ['tackling', 'passing', 'interceptions', 'stamina', 'strength'],
    mentalTraits: ['workRate', 'positioning', 'vision'],
    physicalFocus: ['stamina', 'strength', 'pace'],
    trainingPriority: {
      technical: 55,
      physical: 30,
      mental: 15
    }
  },
  CM: {
    name: 'Central Midfielder',
    keyAttributes: ['passing', 'dribbling', 'stamina', 'vision', 'ballControl'],
    mentalTraits: ['vision', 'decision', 'composure'],
    physicalFocus: ['stamina', 'agility', 'balance'],
    trainingPriority: {
      technical: 60,
      physical: 25,
      mental: 15
    }
  },
  CAM: {
    name: 'Attacking Midfielder',
    keyAttributes: ['passing', 'dribbling', 'shooting', 'vision', 'creativity'],
    mentalTraits: ['vision', 'creativity', 'composure'],
    physicalFocus: ['agility', 'balance', 'acceleration'],
    trainingPriority: {
      technical: 65,
      physical: 20,
      mental: 15
    }
  },
  LW: {
    name: 'Left Winger',
    keyAttributes: ['pace', 'dribbling', 'crossing', 'acceleration', 'agility'],
    mentalTraits: ['flair', 'decision', 'workRate'],
    physicalFocus: ['pace', 'acceleration', 'agility'],
    trainingPriority: {
      technical: 55,
      physical: 35,
      mental: 10
    }
  },
  RW: {
    name: 'Right Winger',
    keyAttributes: ['pace', 'dribbling', 'crossing', 'acceleration', 'agility'],
    mentalTraits: ['flair', 'decision', 'workRate'],
    physicalFocus: ['pace', 'acceleration', 'agility'],
    trainingPriority: {
      technical: 55,
      physical: 35,
      mental: 10
    }
  },
  ST: {
    name: 'Striker',
    keyAttributes: ['finishing', 'positioning', 'strength', 'heading', 'pace'],
    mentalTraits: ['composure', 'anticipation', 'off_the_ball'],
    physicalFocus: ['strength', 'jumping', 'acceleration'],
    trainingPriority: {
      technical: 60,
      physical: 30,
      mental: 10
    },
    specificAdvice: {
      finishing: 'Pick your spot, stay calm, follow through completely.',
      positioning: 'Make runs behind defense, find space in the box.',
      strength: 'Hold up play, shield the ball, bring teammates into play.',
      heading: 'Time your jump, use your neck muscles, direct the ball.',
      movement: 'Vary your runs, check to feet, then spin behind.'
    }
  }
};

export const analyzePlayerByPosition = (player) => {
  const position = player.position || 'CM';
  const analysis = POSITION_ANALYSIS[position];
  
  if (!analysis) return null;
  
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  
  // Analyze key attributes for this position
  analysis.keyAttributes.forEach(attr => {
    const value = player[attr] || 50;
    if (value >= 75) {
      strengths.push({ attribute: attr, value, status: 'excellent' });
    } else if (value >= 65) {
      strengths.push({ attribute: attr, value, status: 'good' });
    } else if (value < 55) {
      weaknesses.push({ attribute: attr, value, priority: value < 45 ? 'high' : 'medium' });
    }
  });
  
  // Generate position-specific recommendations
  if (position === 'GK') {
    recommendations.push('Focus on shot-stopping drills daily');
    recommendations.push('Practice distribution under pressure');
    recommendations.push('Work on communication with defense');
  } else if (['CB', 'LB', 'RB'].includes(position)) {
    recommendations.push('Master 1v1 defending situations');
    recommendations.push('Improve aerial duels and heading');
    recommendations.push('Work on playing out from the back');
  } else if (['CDM', 'CM', 'CAM'].includes(position)) {
    recommendations.push('Develop both feet for passing');
    recommendations.push('Improve first touch under pressure');
    recommendations.push('Work on through ball timing');
  } else if (['LW', 'RW', 'ST'].includes(position)) {
    recommendations.push('Practice finishing from different angles');
    recommendations.push('Improve 1v1 dribbling skills');
    recommendations.push('Work on movement in final third');
  }
  
  return {
    position: analysis.name,
    strengths,
    weaknesses,
    recommendations,
    trainingPriority: analysis.trainingPriority,
    specificAdvice: analysis.specificAdvice || {}
  };
};

export const getPositionSpecificTraining = (position, weaknesses) => {
  const analysis = POSITION_ANALYSIS[position];
  if (!analysis) return [];
  
  const training = [];
  
  weaknesses.forEach(weakness => {
    if (position === 'GK') {
      switch (weakness.attribute) {
        case 'diving':
          training.push({
            drill: 'Diving Technique',
            description: 'Practice collapse dives, extension saves, and recovery',
            duration: '30 mins',
            frequency: 'Daily'
          });
          break;
        case 'handling':
          training.push({
            drill: 'Handling Under Pressure',
            description: 'Catch balls with defenders applying pressure',
            duration: '25 mins',
            frequency: '4x per week'
          });
          break;
      }
    } else if (['ST', 'LW', 'RW'].includes(position)) {
      switch (weakness.attribute) {
        case 'finishing':
          training.push({
            drill: 'Clinical Finishing',
            description: '1v1 with keeper, various angles and distances',
            duration: '35 mins',
            frequency: '5x per week'
          });
          break;
        case 'dribbling':
          training.push({
            drill: 'Cone Weaving',
            description: 'Tight control through cones at pace',
            duration: '20 mins',
            frequency: 'Daily'
          });
          break;
      }
    }
  });
  
  return training;
};