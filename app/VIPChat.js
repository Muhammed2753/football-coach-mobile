// app/VIPChat.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { generateSmartResponse } from './utils/smartCoachEngine';
import { getRandomInspiration } from './utils/inspirations';

const CHAT_STORAGE_KEY = 'vip_chat_messages';
const USER_CONTEXT_KEY = 'user_coach_context';
const CONVERSATION_MEMORY_KEY = 'vip_conversation_memory';

// === SMART CONTEXT ENGINE ===
class SmartCoachContext {
  constructor(initialContext = {}) {
    this.context = {
      name: 'Champion',
      position: null,
      skillLevel: 'beginner', // beginner, intermediate, advanced
      goals: [],
      challenges: [],
      preferences: { tone: 'encouraging', detail: 'concise' },
      lastTopics: [],
      progress: {}, // { passing: { lastPracticed: '2024-01-15', confidence: 6 } }
      specialNeeds: { disability: false, mentalHealth: false },
      ...initialContext
    };
  }

  update(newData) {
    this.context = { ...this.context, ...newData };
    return this.context;
  }

  get(key, defaultValue = null) {
    return this.context[key] ?? defaultValue;
  }

  // Smart position detection with confidence scoring
  detectPosition(message, history = []) {
    const text = [message, ...history.slice(-5).map(m => m.text || '')].join(' ').toLowerCase();
    
    const positionSignals = {
      'goalkeeper': { keywords: ['gk', 'goalkeeper', 'keeper', 'save', 'diving', 'handling', 'penalty'], weight: 3 },
      'center back': { keywords: ['cb', 'center back', 'defender', 'marking', 'tackle', 'aerial'], weight: 2 },
      'full back': { keywords: ['rb', 'lb', 'wing back', 'overlap', 'cross', 'track back'], weight: 2 },
      'defensive midfielder': { keywords: ['cdm', 'holding', 'shield', 'break up', 'number 6'], weight: 2 },
      'central midfielder': { keywords: ['cm', 'box to box', 'engine', 'number 8', 'link play'], weight: 2 },
      'attacking midfielder': { keywords: ['cam', 'number 10', 'playmaker', 'through ball', 'assist'], weight: 2 },
      'winger': { keywords: ['lw', 'rw', 'wing', 'dribble', 'beat man', 'cut inside'], weight: 2 },
      'striker': { keywords: ['st', 'striker', 'forward', 'finish', 'goal', 'number 9'], weight: 3 }
    };

    let bestMatch = { position: 'general', score: 0 };
    
    for (const [position, { keywords, weight }] of Object.entries(positionSignals)) {
      const matches = keywords.filter(kw => text.includes(kw)).length;
      const score = matches * weight;
      if (score > bestMatch.score) {
        bestMatch = { position, score };
      }
    }
    
    // Only return if confidence is high enough
    return bestMatch.score >= 2 ? bestMatch.position : this.context.position || 'general';
  }

  // Detect special needs with empathy
  detectSpecialNeeds(message, history = []) {
    const text = [message, ...history.slice(-3).map(m => m.text || '')].join(' ').toLowerCase();
    
    return {
      hasDisability: /disab|wheelchair|mobility|prosth|amputee|visual impair|blind|deaf|adaptive|para football/i.test(text),
      hasMentalStress: /anxiety|depress|stress|overwhelm|panic|adhd|ocd|mental health|burnout|nervous|scared|pressure|confidence/i.test(text),
      isYoungPlayer: /\b(1[0-4]|under 15|youth|junior|school)\b/i.test(text),
      isReturning: /comeback|return|after injury|back to play/i.test(text)
    };
  }

  // Remember user preferences from conversation
  learnFromInteraction(userMessage, coachResponse) {
    const text = userMessage.toLowerCase();
    
    // Detect skill level from language
    if (/\b(pro|expert|advanced|years of experience)\b/i.test(text)) {
      this.update({ skillLevel: 'advanced' });
    } else if (/\b(beginner|new|just started|learning)\b/i.test(text)) {
      this.update({ skillLevel: 'beginner' });
    }
    
    // Detect tone preference
    if (/\b(more detail|explain|why|how does)\b/i.test(text)) {
      this.update({ preferences: { ...this.context.preferences, detail: 'detailed' } });
    }
    
    // Track topics for personalization
    const topicKeywords = ['passing', 'shooting', 'dribbling', 'fitness', 'mental', 'tactics', 'nutrition'];
    const detectedTopic = topicKeywords.find(kw => text.includes(kw));
    if (detectedTopic) {
      const topics = [...new Set([...(this.context.lastTopics || []), detectedTopic])].slice(-5);
      this.update({ lastTopics: topics });
    }
  }
}

// === ENHANCED RESPONSE GENERATORS ===
const generateEncouragingOpener = (context) => {
  const { name, position, skillLevel } = context;
  const openers = [
    `Hey ${name}! 👋 Great to see you. Whether you're a ${skillLevel} ${position || 'player'} or just starting out, I'm here to help you grow. What's on your mind today?`,
    `${name}, your dedication inspires me! 💪 Let's make today's session count. What skill or challenge shall we tackle?`,
    `Welcome back, ${name}! 🙌 Every pro was once a beginner. What's one thing you'd love to improve right now?`
  ];
  return openers[Math.floor(Math.random() * openers.length)];
};

const generatePositionSpecificAdvice = (position, message, context) => {
  const { name, skillLevel } = context;
  const isBeginner = skillLevel === 'beginner';
  
  const adviceDB = {
    'goalkeeper': [
      isBeginner 
        ? `${name}, let's start simple: **W-grip** behind the ball, **soft hands** to cushion, **eyes on the ball** all the way. Try 10 wall catches — you'll feel the difference!`
        : `${name}, elite GKs win games with **distribution**. Practice: 1-touch throw to a target 15 yards out. Accuracy > power at first.`,
      `Your command of the box is your superpower, ${name}. 🗣️ Talk constantly: "Keeper's!", "Away!", "Step up!". Your voice organizes the defense.`,
      `Penalty saving tip: ${isBeginner ? 'Watch the shooters plant foot — it points where they are likely to shoot.' : 'Study shooter patterns — most favor their strong side under pressure.'}`
    ],
    'striker': [
      isBeginner
        ? `${name}, finishing starts BEFORE the shot: **Body over the ball** for power, **eyes on target**, **follow through**. 5 reps, 3x/day = transformation.`
        : `${name}, movement off the ball wins games. Practice: **Check away → explode back** to lose your marker. Timing > speed.`,
      `First touch = first chance, ${name}. Drill: Wall passes → control with back foot → shoot in 2 touches. Crispness creates goals.`,
      `Mental tip for strikers: Missed a chance? Next play is your redemption. Even Haaland misses — what matters is the next action.`
    ],
    'central midfielder': [
      `The engine room, ${name}! 💨 Your job: **Scan before receiving** (shoulder check), **one-touch when possible**, **cover when teammates push up.`,
      `Passing lanes are invisible highways, ${name}. Practice: 3-cone triangle passing — one-touch only. Speed of thought > speed of foot.`,
      `Defensive transition tip: Lose the ball? **Immediate pressure for 3 seconds** → if not won, **drop and reorganize**. Smart defending wins titles.`
    ],
    // Add more positions as needed...
  };
  
  const positionAdvice = adviceDB[position] || adviceDB['central midfielder'];
  return positionAdvice[Math.floor(Math.random() * positionAdvice.length)];
};

const generateDisabilityInclusiveAdvice = (context) => {
  const { name } = context;
  return `Football is for EVERYONE, ${name}! 🌍\n\n✨ **Adaptive options**:\n• Frame Football (wheelchair users)\n• Blind Football (audio ball + guides)\n• Powerchair Football (electric chairs)\n• CP Football (cerebral palsy)\n\n✨ **Universal tips**:\n• Focus on **decision-making** — vision > speed\n• Use **voice cues** if visual impaired\n• Modify drills: seated passing, stationary shooting\n\nOrganizations like **CPISRA**, **IBSA**, and **The FA Inclusion** have amazing resources. You belong on the pitch! 💙`;
};

const generateMentalWellnessSupport = (context) => {
  const { name } = context;
  return `${name}, your mind matters as much as your feet. 💙\n\n🧠 **Quick resets**:\n• 4-7-8 breathing: Inhale 4s, hold 7s, exhale 8s\n• Grounding: Name 5 things you see, 4 you feel, 3 you hear\n• Self-talk: "I am prepared. I am capable."\n\n⚽ **Football-specific**:\n• Focus on PROCESS goals ("complete 5 passes") not outcome ("score")\n• Celebrate EFFORT — showing up is 80% of success\n• Talk to someone: coach, teammate, therapist — strength in vulnerability\n\nYou're not alone. Even Messi, Ronaldo, and Marta have mental challenges. What matters is you keep going. I believe in you. 🙌`;
};

const generateMicroDrill = (skill, context) => {
  const { name, skillLevel, position } = context;
  const isBeginner = skillLevel === 'beginner';
  
  const drills = {
    'passing': isBeginner
      ? `🎯 Wall Pass Drill (5 mins):\n1. Stand 2 yards from wall\n2. Pass firmly → control first touch → pass again\n3. 20 reps each foot\n💡 Keep ankle locked, eyes up between reps!`
      : `🎯 Pressure Passing (10 mins):\n1. Set 3 cones in triangle (5-yard sides)\n2. Partner calls "LEFT"/"RIGHT" as you receive\n3. Pass to called cone in 1 touch\n💡 Scan BEFORE receiving — know your options!`,
      
    'shooting': isBeginner
      ? `⚽ Confidence Finishing:\n1. Place ball 6 yards out\n2. Focus on PLACEMENT over power\n3. Hit 5 corners: top-left, top-right, bottom-left, bottom-right, center\n💡 Plant foot beside ball, eyes on target!`
      : `⚽ Game-Speed Finishing:\n1. Partner serves ball from side\n2. Control → shoot in 2 touches MAX\n3. Alternate feet, vary angles\n💡 Shoot EARLY — before defender closes!`,
      
    'dribbling': isBeginner
      ? `🌀 Close Control Basics:\n1. Dribble in small circle (2-yard diameter)\n2. Use BOTH feet, light touches\n3. 30 seconds on, 15 rest x 4 rounds\n💡 Keep ball within 1 foot — control > speed!`
      : `🌀 1v1 Moves:\n1. Set cone as "defender"\n2. Practice ONE move: stepover, scissors, or body feint\n3. Execute at 70% speed → build to 100%\n💡 Sell the fake with eyes + shoulders!`,
      
    'mental': `🧠 2-Minute Reset:\n1. Stop. Breathe deeply 3x\n2. Ask: "What's ONE thing I can control right now?"\n3. Focus ONLY on that\n💡 Pressure is privilege — it means you matter!`,
      
    'fitness': isBeginner
      ? `🏃 Beginner Endurance:\n• Walk/jog intervals: 1 min jog, 2 min walk x 10\n• Add 10 sec jogging each session\n• Hydrate + rest days are PART of training!`
      : `🏃 Football-Specific Conditioning:\n• Shuttle runs: 10y → 20y → 30y → 20y → 10y (no rest)\n• Rest 90 sec, repeat 4x\n• Mimics match demands!`
  };
  
  // Nigerian/local flavor
  if (position === 'striker' && skill === 'shooting') {
    return `🇳🇬 Nigerian Striker Special:\n\n1. Use a plastic bag as ball (like Jay-Jay!)\n2. Practice stepovers in your compound\n3. Finish with a chip over a water bottle!\n\nCreativity > fancy gear. You've got the magic! ✨`;
  }
  
  return drills[skill] || `Grab a ball and a wall, ${name}! 10 minutes of focused reps beats 1 hour of unfocused play. What skill shall we drill today?`;
};

// === MAIN SMART RESPONSE ENGINE ===
const generateCoachResponse = (userMessage, conversationHistory, smartContext) => {
  const message = userMessage.toLowerCase().trim();
  const { name } = smartContext.context;
  
  // === 1. Quick-help commands (priority) ===
  if (userMessage.startsWith('/')) {
    const [cmd, ...args] = userMessage.split(' ');
    const param = args[0]?.toLowerCase();
    
    const commands = {
      '/drill': (skill) => `Here's your drill, ${name}!\n\n${generateMicroDrill(skill, smartContext.context)}`,
      '/position': (pos) => {
        const valid = ['gk','cb','rb','lb','cdm','cm','cam','lw','rw','st'];
        if (valid.includes(pos)) {
          smartContext.update({ position: pos });
          return `Got it! I'll focus on ${pos.toUpperCase()} tips for you, ${name}. Ask away!`;
        }
        return `Positions: ${valid.join(', ')}\nExample: /position st`;
      },
      '/help': () => `Quick commands:\n/drill [passing|shooting|dribbling]\n/position [st|gk|cm...]\n/mental (wellness tips)\n/help\n\nOr just chat naturally! 😊`,
      '/inspire': () => getRandomInspiration(),
      '/mental': () => generateMentalWellnessSupport(smartContext.context)
    };
    
    if (commands[cmd]) return commands[cmd](param);
  }
  
  // === 2. Detect special needs FIRST (safety priority) ===
  const specialNeeds = smartContext.detectSpecialNeeds(message, conversationHistory);
  if (specialNeeds.hasDisability) return generateDisabilityInclusiveAdvice(smartContext.context);
  if (specialNeeds.hasMentalStress) return generateMentalWellnessSupport(smartContext.context);
  
  // === 3. Effort celebration (positive reinforcement) ===
  const effortWords = ['trained', 'practiced', 'did', 'tried', 'worked', 'repeated', 'drilled', 'showed up'];
  if (effortWords.some(w => message.includes(w))) {
    return `That's HUGE, ${name}! 🙌 Consistency beats talent when talent doesn't work hard. What part felt best? What's next?`;
  }
  
  // === 4. Clarify vague struggles (empathetic probing) ===
  const vagueWords = ['struggling', 'hard', 'difficult', 'can\'t', 'not good', 'bad at', 'frustrated'];
  if (vagueWords.some(w => message.includes(w)) && !message.includes('youtube')) {
    return `I'm here for you, ${name}. To give spot-on advice, help me understand:\n\n• What position do you play?\n• What specifically feels tough?\n• How long have you been working on it?\n\nNo judgment — just solutions! 💙`;
  }
  
  // === 5. Handle complaints with humility ===
  const isComplaining = /not offering|doesn't have|wrong|bad recommendation|not helpful|doesn't work|tried that|already checked/i.test(message);
  if (isComplaining) {
    return `My bad, ${name}! You deserve better. Tell me exactly what you've tried and what you need — I'll give you something that actually works. No fluff!`;
  }
  
  // === 6. Foul language → gentle redirect ===
  const FOUL_WORDS = ['damn', 'shit', 'fuck', 'bitch', 'ass', 'hell', 'crap', 'stupid', 'idiot'];
  if (FOUL_WORDS.some(word => message.includes(word))) {
    return `Hey, I get it — football's frustrating sometimes! 😅 Let's reset: what's ONE thing you'd love to improve today? I'm all in to help.`;
  }
  
  // === 7. Mental health keywords → supportive response ===
  if (/confidence|nervous|scared|mental|pressure|anxiety|overwhelm/i.test(message)) {
    return generateMentalWellnessSupport(smartContext.context);
  }
  
  // === 8. Position detection + personalized advice ===
  const detectedPosition = smartContext.detectPosition(message, conversationHistory);
  if (detectedPosition !== 'general' && detectedPosition !== smartContext.context.position) {
    smartContext.update({ position: detectedPosition });
  }
  
  // Position-specific advice
  if (detectedPosition !== 'general') {
    return generatePositionSpecificAdvice(detectedPosition, message, smartContext.context);
  }
  
  // === 9. Skill-specific micro-drills ===
  const skillKeywords = {
    'passing': /pass|through ball|cross|distribute/i,
    'shooting': /shoot|finish|goal|strike|volley/i,
    'dribbling': /dribbl|beat man|stepover|scissors/i,
    'fitness': /fit|stamina|endurance|tired|condition/i,
    'mental': /mind|confidence|focus|nervous|pressure/i
  };
  
  for (const [skill, regex] of Object.entries(skillKeywords)) {
    if (regex.test(message)) {
      return `${name}, ${generateMicroDrill(skill, smartContext.context)}`;
    }
  }
  
  // === 10. Fallback: Smart engine + conversational prompt ===
  const smartResponse = generateSmartResponse(userMessage, conversationHistory, smartContext.context);
  
  // If smart engine returns generic, enhance with personality
  if (smartResponse.length < 50 || /ask me|tell me|what/i.test(smartResponse)) {
    return `${generateEncouragingOpener(smartContext.context)}\n\n(P.S. Try /drill passing or tell me your position for tailored tips!)`;
  }
  
  return smartResponse;
};

// === COMPONENT ===
export default function VIPChat() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVIP, setIsVIP] = useState(false);
  const [checkingVIP, setCheckingVIP] = useState(true);
  
  // Smart context manager (persists across sessions)
  const [smartContext] = useState(() => new SmartCoachContext());
  const flatListRef = useRef(null);
  
  useEffect(() => {
    checkVIPAccess();
  }, []);
  
  useEffect(() => {
    if (isVIP) {
      loadContext();
      loadMessages();
    }
  }, [isVIP]);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  const loadContext = async () => {
    try {
      // Load user context
      const storedContext = await AsyncStorage.getItem(USER_CONTEXT_KEY);
      if (storedContext) {
        smartContext.update(JSON.parse(storedContext));
      } else {
        // Initialize from user profile
        const userStored = await AsyncStorage.getItem('user');
        const userName = userStored ? JSON.parse(userStored)?.name || 'Champion' : 'Champion';
        smartContext.update({ name: userName });
        await AsyncStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(smartContext.context));
      }
      
      // Load conversation memory for continuity
      const memory = await AsyncStorage.getItem(CONVERSATION_MEMORY_KEY);
      if (memory) {
        const parsed = JSON.parse(memory);
        if (parsed.lastTopics) smartContext.update({ lastTopics: parsed.lastTopics });
      }
    } catch (error) {
      console.error('Failed to load context:', error);
    }
  };
  
  const checkVIPAccess = async () => {
    try {
      // ✅ Production: Check real subscription status
      const vipStatus = await AsyncStorage.getItem('isVIP');
      
      // 🧪 DEV MODE: Auto-grant access for testing (REMOVE BEFORE PRODUCTION)
      if (__DEV__ && vipStatus === null) {
        await AsyncStorage.setItem('isVIP', 'true');
        setIsVIP(true);
        setCheckingVIP(false);
        return;
      }
      
      if (vipStatus !== 'true') {
        Alert.alert(
          'Premium Feature',
          'VIP Coach Chat is only available for Premium members. Would you like to upgrade?',
          [
            { text: 'Cancel', onPress: () => router.back() },
            { 
              text: 'Upgrade Now', 
              onPress: () => router.replace('/VIPSubscription'),
              style: 'default'
            }
          ]
        );
        return;
      }
      setIsVIP(true);
    } catch (error) {
      console.error('VIP check failed:', error);
      Alert.alert('Error', 'Failed to verify VIP status');
      router.back();
    } finally {
      setCheckingVIP(false);
    }
  };
  
  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        // Personalized welcome
        const welcomeMsg = {
          id: '1',
          text: generateEncouragingOpener(smartContext.context),
          sender: 'Coach',
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMsg]);
        await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([welcomeMsg]));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };
  
  const startNewChat = async () => {
    const freshStart = {
      id: Date.now().toString(),
      text: `Fresh start, ${smartContext.context.name}! 💪\n\nWhat's your focus today?\n• Skill drill? (/drill passing)\n• Mental boost? (/mental)\n• Position advice? (/position st)\n\nI'm all yours!`,
      sender: 'Coach',
      timestamp: new Date().toISOString()
    };
    setMessages([freshStart]);
    await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([freshStart]));
  };
  
  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
      // Save conversation memory for continuity
      await AsyncStorage.setItem(CONVERSATION_MEMORY_KEY, JSON.stringify({
        lastTopics: smartContext.context.lastTopics,
        lastPosition: smartContext.context.position,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !isVIP || loading) return;
    
    const userText = newMessage.trim();
    setLoading(true);
    setNewMessage('');
    
    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      text: userText,
      sender: 'Player',
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Learn from this interaction
    smartContext.learnFromInteraction(userText, '');
    
    // Simulate "thinking" time (more natural)
    const thinkingTime = 800 + Math.random() * 1200;
    
    setTimeout(async () => {
      try {
        // Generate smart response
        const coachText = generateCoachResponse(userText, updatedMessages, smartContext);
        
        const coachMessage = {
          id: (Date.now() + 1).toString(),
          text: coachText,
          sender: 'Coach',
          timestamp: new Date().toISOString()
        };
        
        const finalMessages = [...updatedMessages, coachMessage];
        setMessages(finalMessages);
        await saveMessages(finalMessages);
        
        // Update context with detected info
        await AsyncStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(smartContext.context));
        
      } catch (error) {
        console.error('Response generation failed:', error);
        // Fallback response
        const fallback = {
          id: (Date.now() + 1).toString(),
          text: `I want to give you the best advice, ${smartContext.context.name}! Could you tell me a bit more about what you're working on? 🙌`,
          sender: 'Coach',
          timestamp: new Date().toISOString()
        };
        setMessages([...updatedMessages, fallback]);
      } finally {
        setLoading(false);
      }
    }, thinkingTime);
  };
  
  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'Player' ? styles.playerMessage : styles.coachMessage
    ]}>
      <Text style={styles.senderName}>{item.sender === 'Coach' ? '🤖 Coach' : '👤 You'}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
  
  if (checkingVIP) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💬 VIP Coach Chat</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking Premium access...</Text>
        </View>
      </View>
    );
  }
  
  if (!isVIP) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💬 VIP Coach Chat</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Premium access required</Text>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.replace('/VIPSubscription')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Unlock</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💬 VIP Coach Chat</Text>
        <TouchableOpacity onPress={startNewChat} style={styles.newChatButton}>
          <Text style={styles.newChatIcon}>🆕</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask your coach... (Try /help!)"
          placeholderTextColor="#666"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, (loading || !newMessage.trim()) && styles.disabledButton]}
          onPress={sendMessage}
          disabled={loading || !newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>{loading ? '⏳' : '➤'}</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.hintButton}
        onPress={() => setNewMessage('/help')}
      >
        <Text style={styles.hintText}>💡 Try: /help • /drill passing • /mental • /inspire</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#1b263b',
    backgroundColor: '#0d1b2a'
  },
  backButton: { padding: 8, marginRight: 8 },
  backText: { color: '#1e88e5', fontSize: 20, fontWeight: 'bold' },
  title: { 
    flex: 1, 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#f1faee', 
    textAlign: 'center' 
  },
  newChatButton: { padding: 8 },
  newChatIcon: { fontSize: 18 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#a8dadc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: { flex: 1 },
  messagesContainer: { padding: 16, flexGrow: 1 },
  messageBubble: { 
    maxWidth: '85%', 
    padding: 14, 
    borderRadius: 16, 
    marginVertical: 6,
    alignSelf: 'flex-start'
  },
  playerMessage: { 
    backgroundColor: '#1e88e5', 
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4
  },
  coachMessage: { 
    backgroundColor: '#1b263b',
    borderBottomLeftRadius: 4
  },
  senderName: {
    color: '#a8dadc',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.9
  },
  messageText: { 
    color: '#f1faee', 
    fontSize: 15, 
    marginBottom: 6, 
    lineHeight: 22,
    fontWeight: '400'
  },
  messageTime: { 
    color: '#6c757d', 
    fontSize: 10, 
    opacity: 0.8,
    alignSelf: 'flex-end'
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1b263b',
    backgroundColor: '#0d1b2a'
  },
  input: { 
    flex: 1, 
    backgroundColor: '#1b263b', 
    color: '#f1faee', 
    padding: 14, 
    borderRadius: 20, 
    maxHeight: 120,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a3f5f'
  },
  sendButton: { 
    backgroundColor: '#1e88e5', 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledButton: { opacity: 0.5 },
  sendButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  hintButton: {
    padding: 10,
    alignItems: 'center',
  },
  hintText: {
    color: '#6c757d',
    fontSize: 12,
    fontStyle: 'italic',
  },
});