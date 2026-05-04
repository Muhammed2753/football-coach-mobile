// app/VIPChat.js - Real AI Coach Experience
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, 
  Alert, Linking, KeyboardAvoidingView, Platform, Animated, 
  ActivityIndicator, LayoutAnimation, UIManager 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// === 🧠 AI COACH PERSONALITY & BRAIN ===
const AI_COACH = {
  name: 'Coach AI',
  personality: {
    tone: 'encouraging', // encouraging, direct, playful, serious
    empathy: 'high',
    expertise: 'elite',
    humor: 'light',
  },
  
  // Natural conversation starters
  openers: [
    "Hey {name}! 👋 Ready to level up today? What's on your mind?",
    "{name}, great to see you! 💪 Whether you're warming up or winding down, I'm here. What shall we tackle?",
    "Welcome back, champion! 🙌 Every pro started where you are. What's your focus today?",
  ],
  
  // Empathetic responses for different emotions
  empathyResponses: {
    frustrated: "I hear you, {name}. Football can be tough sometimes. Let's break this down together — what specifically feels challenging right now?",
    excited: "Love that energy, {name}! 🔥 Let's channel it. What skill are you most excited to work on?",
    nervous: "It's totally normal to feel that way, {name}. Even pros get nervous. Let's focus on one small win today. What feels manageable?",
    proud: "That's amazing, {name}! 🎉 Celebrate that win. What's the next step you're excited about?",
  },
  
  // Smart follow-up questions to keep conversation flowing
  followUps: {
    afterAdvice: [
      "How does that sound for your next session?",
      "Want me to break that down further?",
      "What part of that resonates most with you?",
    ],
    afterDrill: [
      "How did that drill feel when you tried it?",
      "Want to adjust the difficulty or try a variation?",
      "What's one thing you noticed while doing that?",
    ],
    afterEncouragement: [
      "What's one small action you can take today toward that goal?",
      "Who can you share this progress with for accountability?",
      "How are you feeling about that next step?",
    ],
  },
  
  // Natural transitions between topics
  transitions: {
    skillToMental: "By the way, {name} — how's your mindset feeling lately? Mental game is just as important as footwork. 🧠",
    drillToRecovery: "Great work on that drill! 💦 Remember: recovery is where growth happens. How's your rest and hydration looking?",
    generalToSpecific: "I'd love to give you more tailored advice. What position do you play, and what's one skill you're focusing on this week?",
  },
};

// === 🎭 NATURAL LANGUAGE PROCESSOR ===
class NaturalLanguageProcessor {
  constructor() {
    this.intentPatterns = {
      greeting: /^(hi|hello|hey|greetings|good morning|good afternoon)/i,
      farewell: /^(bye|goodbye|see you|later|catch you)/i,
      thanks: /^(thanks|thank you|appreciate|grateful)/i,
      question: /^(\w+\s)*(what|how|why|when|where|who|can|could|should|will|would)/i,
      request: /^(can you|could you|please|help me|i need|i want)/i,
      statement: /^(i think|i feel|i believe|i notice|i want to)/i,
      emotion: /^(i'm feeling|i feel|i am|i'm so|this is so)/i,
      skill: /^(passing|shooting|dribbling|defending|fitness|tactics|positioning)/i,
      position: /^(goalkeeper|defender|midfielder|winger|striker|full.?back|center.?back)/i,
    };
    
    this.emotionKeywords = {
      positive: ['great', 'awesome', 'amazing', 'love', 'excited', 'proud', 'happy', 'confident'],
      negative: ['frustrated', 'stuck', 'hard', 'difficult', 'can\'t', 'struggling', 'nervous', 'anxious'],
      neutral: ['okay', 'fine', 'alright', 'not sure', 'maybe', 'thinking'],
    };
  }
  
  analyze(message) {
    const text = message.toLowerCase().trim();
    const result = {
      intent: 'unknown',
      emotion: 'neutral',
      entities: [],
      confidence: 0,
    };
    
    // Detect intent
    for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
      if (pattern.test(text)) {
        result.intent = intent;
        result.confidence = 0.8;
        break;
      }
    }
    
    // Detect emotion
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      if (keywords.some(kw => text.includes(kw))) {
        result.emotion = emotion;
        break;
      }
    }
    
    // Extract entities (skills, positions, numbers)
    const skillMatch = text.match(/\b(passing|shooting|dribbling|defending|fitness|tactics)\b/i);
    if (skillMatch) result.entities.push({ type: 'skill', value: skillMatch[1] });
    
    const positionMatch = text.match(/\b(goalkeeper|defender|midfielder|winger|striker)\b/i);
    if (positionMatch) result.entities.push({ type: 'position', value: positionMatch[1] });
    
    const numberMatch = text.match(/\b(\d+)\b/);
    if (numberMatch) result.entities.push({ type: 'number', value: parseInt(numberMatch[1]) });
    
    return result;
  }
}

// === 💬 CONVERSATION MEMORY ===
class ConversationMemory {
  constructor(maxHistory = 20) {
    this.history = [];
    this.maxHistory = maxHistory;
    this.userProfile = {};
    this.sessionContext = {};
  }
  
  add(message, sender) {
    this.history.push({
      id: Date.now().toString() + Math.random(),
      text: message,
      sender,
      timestamp: new Date().toISOString(),
    });
    
    // Keep history manageable
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }
  
  getRecent(count = 5) {
    return this.history.slice(-count);
  }
  
  updateUserProfile(updates) {
    this.userProfile = { ...this.userProfile, ...updates };
  }
  
  getContext(key, defaultValue = null) {
    return this.sessionContext[key] ?? defaultValue;
  }
  
  setContext(key, value) {
    this.sessionContext[key] = value;
  }
  
  // Smart topic tracking
  detectTopic(message) {
    const topics = {
      skills: ['passing', 'shooting', 'dribbling', 'defending', 'fitness'],
      mental: ['confidence', 'nervous', 'pressure', 'focus', 'mindset'],
      tactics: ['formation', 'positioning', 'strategy', 'game plan'],
      recovery: ['rest', 'sleep', 'hydration', 'nutrition', 'injury'],
      goals: ['improve', 'get better', 'level up', 'next season'],
    };
    
    const lower = message.toLowerCase();
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(kw => lower.includes(kw))) {
        return topic;
      }
    }
    return 'general';
  }
}

// === 🎨 MESSAGE FORMATTER (Markdown-like support) ===
const formatMessage = (text) => {
  // Bold: **text** → <Text style={bold}>text</Text>
  // Italic: *text* → <Text style={italic}>text</Text>
  // Line breaks: \n → actual newlines
  // Emojis: preserved as-is
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers for display
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
    .replace(/```([\s\S]*?)```/g, '$1') // Code blocks
    .trim();
};

// === 🎲 RESPONSE GENERATOR (The "Brain") ===
const generateAIResponse = (userMessage, memory, userProfile) => {
  const nlp = new NaturalLanguageProcessor();
  const analysis = nlp.analyze(userMessage);
  const { name = 'Champion', position, skillLevel = 'developing' } = userProfile;
  
  // === 1. Greetings & Farewells ===
  if (analysis.intent === 'greeting') {
    const opener = AI_COACH.openers[Math.floor(Math.random() * AI_COACH.openers.length)];
    return opener.replace('{name}', name);
  }
  
  if (analysis.intent === 'farewell') {
    const closers = [
      `Keep pushing, ${name}! 💪 I'll be here when you're ready for the next session.`,
      `Great chat today, ${name}! 🙌 Remember: progress > perfection. See you soon!`,
      `You've got this, ${name}! ⚽ One step at a time. Come back anytime!`,
    ];
    return closers[Math.floor(Math.random() * closers.length)];
  }
  
  // === 2. Gratitude ===
  if (analysis.intent === 'thanks') {
    const gratitude = [
      `Anytime, ${name}! 🙏 That's what I'm here for. What's next on your list?`,
      `Happy to help, champion! 💙 Keep that momentum going. What shall we tackle next?`,
      `You're welcome, ${name}! 🌟 Your dedication inspires me. Ready for the next challenge?`,
    ];
    return gratitude[Math.floor(Math.random() * gratitude.length)];
  }
  
  // === 3. Emotional Support (Priority) ===
  if (analysis.emotion === 'negative') {
    const empathy = AI_COACH.empathyResponses.frustrated.replace('{name}', name);
    return `${empathy}\n\n💡 Quick reset: Take a deep breath. What's ONE small thing you can control right now?`;
  }
  
  if (analysis.emotion === 'positive') {
    const hype = AI_COACH.empathyResponses.excited.replace('{name}', name);
    return `${hype}\n\n🔥 Let's channel that energy! What skill are you most excited to work on today?`;
  }
  
  // === 4. Skill-Specific Advice ===
  if (analysis.entities.some(e => e.type === 'skill')) {
    const skill = analysis.entities.find(e => e.type === 'skill').value;
    const drills = {
      passing: `🎯 **Passing Focus**, ${name}:\n\n• Wall passes: 2 yards away, 20 reps each foot\n• Target practice: Hit a cone from 10 yards\n• One-touch: Partner serves, you return instantly\n\n💡 Pro tip: Ankles locked, eyes up between touches!`,
      shooting: `⚽ **Finishing Focus**, ${name}:\n\n• Placement over power: Hit corners, not just hard\n• First touch setup: Control into shooting position\n• Game speed: Add a defender (cone) for pressure\n\n💡 Pro tip: Plant foot beside ball, eyes on target!`,
      dribbling: `🌪️ **Dribbling Focus**, ${name}:\n\n• Close control: Dribble in small circle, light touches\n• Change of pace: Slow → burst → slow\n• Moves: Master ONE (stepover, scissors, body feint)\n\n💡 Pro tip: Keep ball within 1 foot — control > speed!`,
      defending: `🛡️ **Defending Focus**, ${name}:\n\n• Stance: Low, balanced, on balls of feet\n• Angle: Force attacker to weak side\n• Patience: Don't dive in — jockey and wait\n\n💡 Pro tip: Watch the ball AND the attacker's hips!`,
      fitness: `🏃 **Fitness Focus**, ${name}:\n\n• Intervals: 30s sprint, 90s walk x 8 rounds\n• Agility: Ladder drills or cone weaves\n• Core: Plank variations for stability\n\n💡 Pro tip: Consistency beats intensity — show up daily!`,
    };
    
    const drill = drills[skill] || `Great focus on ${skill}, ${name}! Let's build a custom drill. What's your current level with this skill?`;
    return drill;
  }
  
  // === 5. Position-Specific Wisdom ===
  if (analysis.entities.some(e => e.type === 'position')) {
    const pos = analysis.entities.find(e => e.type === 'position').value;
    const wisdom = {
      goalkeeper: `🧤 **GK Wisdom**, ${name}:\n\n• Command your box: Voice = your superpower\n• Distribution: Practice throws to targets\n• Mental: Next play is always the most important\n\n💡 Pro tip: Study shooters' plant feet — they reveal intent!`,
      defender: `🧱 **Defender Wisdom**, ${name}:\n\n• Positioning: Stay goal-side, force wide\n• Communication: Talk constantly — organize your line\n• Recovery: Speed back > speed forward\n\n💡 Pro tip: Win the first duel — set the tone!`,
      midfielder: `⚙️ **Midfielder Wisdom**, ${name}:\n\n• Scan: Shoulder check before receiving\n• Transition: First thought after losing ball = pressure\n• Vision: See the field, not just the ball\n\n💡 Pro tip: One-touch passing speeds up the game!`,
      winger: `⚡ **Winger Wisdom**, ${name}:\n\n• 1v1: Master one move, execute with confidence\n• Crossing: Early ball > perfect ball\n• Tracking back: Defense wins championships\n\n💡 Pro tip: Use the sideline as a teammate!`,
      striker: `🎯 **Striker Wisdom**, ${name}:\n\n• Movement: Lose your marker before the ball arrives\n• Finishing: Placement > power, always\n• Mentality: Missed chance? Next play is redemption\n\n💡 Pro tip: Shoot early — before defender closes!`,
    };
    
    return (wisdom[pos] || `Great position, ${name}! Let's tailor advice. What's one aspect of ${pos} play you want to improve?`).replace('{name}', name);
  }
  
  // === 6. Mental Game Support ===
  if (memory.detectTopic(userMessage) === 'mental') {
    return `🧠 **Mental Game**, ${name}:\n\n• Breathing: 4-7-8 technique (inhale 4s, hold 7s, exhale 8s)\n• Self-talk: Replace "I can't" with "I'm learning"\n• Focus: Process goals ("complete 5 passes") > outcome ("score")\n\n💡 Remember: Even Messi feels pressure. What matters is you keep going. I believe in you. 🙌`;
  }
  
  // === 7. Goal Setting & Motivation ===
  if (memory.detectTopic(userMessage) === 'goals') {
    return `🎯 **Goal Setting**, ${name}:\n\n• Make it SMART: Specific, Measurable, Achievable, Relevant, Time-bound\n• Break it down: Big goal → weekly actions → daily habits\n• Track progress: Journal wins, learn from setbacks\n\n💡 Example: "Improve weak foot passing" → "10 wall passes with left foot daily" → "Confidence in games"\n\nWhat's one goal you'd like to set today?`;
  }
  
  // === 8. Natural Conversation Flow ===
  const recentTopic = memory.detectTopic(memory.getRecent(3).map(m => m.text).join(' '));
  if (recentTopic !== 'general' && Math.random() > 0.7) {
    const transition = AI_COACH.transitions[`${recentTopic}ToGeneral`] || AI_COACH.transitions.generalToSpecific;
    return transition.replace('{name}', name);
  }
  
  // === 9. Smart Follow-Up ===
  const lastMessage = memory.getRecent(1)[0];
  if (lastMessage?.sender === 'Coach' && Math.random() > 0.5) {
    const followUpType = Object.keys(AI_COACH.followUps)[Math.floor(Math.random() * 3)];
    const followUps = AI_COACH.followUps[followUpType];
    return followUps[Math.floor(Math.random() * followUps.length)];
  }
  
  // === 10. Fallback: Engaging & Open-Ended ===
  const fallbacks = [
    `Interesting perspective, ${name}! 🤔 Help me understand: what's the biggest challenge you're facing with that right now?`,
    `I'd love to give you the best advice possible, ${name}. Could you tell me a bit more about your current situation? 🙏`,
    `Great question, ${name}! 💭 To tailor my response: What position do you play, and what's your main focus this week?`,
  ];
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

// === 🎬 TYPING INDICATOR COMPONENT ===
const TypingIndicator = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.typingBubble}>
      <Text style={styles.typingText}>Coach AI is thinking{dots}</Text>
    </View>
  );
};

// === 💬 MAIN COMPONENT ===
export default function VIPChat() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVIP, setIsVIP] = useState(false);
  const [checkingVIP, setCheckingVIP] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  // Initialize AI brain
  const memoryRef = useRef(new ConversationMemory());
  const userProfileRef = useRef({ name: 'Champion', position: null, skillLevel: 'developing' });
  const flatListRef = useRef(null);
  
  // Smooth scrolling
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Check VIP access
  useEffect(() => {
    checkVIPAccess();
  }, []);
  
  // Load context when VIP confirmed
  useEffect(() => {
    if (isVIP) {
      loadUserProfile();
      loadMessages();
    }
  }, [isVIP]);
  
  const checkVIPAccess = async () => {
    try {
      const vipStatus = await AsyncStorage.getItem('isVIP');
      
      // Dev mode: auto-grant for testing
      if (__DEV__ && vipStatus === null) {
        await AsyncStorage.setItem('isVIP', 'true');
        setIsVIP(true);
        setCheckingVIP(false);
        return;
      }
      
      if (vipStatus !== 'true') {
        Alert.alert(
          '✨ Premium Feature',
          'VIP Coach Chat gives you personalized AI coaching. Upgrade to unlock!',
          [
            { text: 'Maybe Later', onPress: () => router.back(), style: 'cancel' },
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
      Alert.alert('Error', 'Failed to verify access');
      router.back();
    } finally {
      setCheckingVIP(false);
    }
  };
  
  const loadUserProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        userProfileRef.current = {
          name: user.name || 'Champion',
          position: user.position || null,
          skillLevel: user.skillLevel || 'developing',
          ...userProfileRef.current,
        };
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };
  
  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem('vip_chat_messages');
      if (stored) {
        const loaded = JSON.parse(stored);
        setMessages(loaded);
        // Restore to memory
        loaded.forEach(m => memoryRef.current.add(m.text, m.sender));
      } else {
        // Personalized welcome
        const { name } = userProfileRef.current;
        const welcome = {
          id: 'welcome',
          text: AI_COACH.openers[0].replace('{name}', name),
          sender: 'Coach',
          timestamp: new Date().toISOString(),
        };
        setMessages([welcome]);
        memoryRef.current.add(welcome.text, welcome.sender);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };
  
  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem('vip_chat_messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  };
  
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !isVIP || loading) return;
    
    const userText = newMessage.trim();
    const { name } = userProfileRef.current;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: userText,
      sender: 'Player',
      timestamp: new Date().toISOString(),
    };
    
    const updated = [...messages, userMessage];
    setMessages(updated);
    memoryRef.current.add(userText, 'Player');
    setNewMessage('');
    setLoading(true);
    setIsTyping(true);
    
    // Simulate "thinking" time (more natural variation)
    const thinkTime = 1000 + Math.random() * 2000;
    
    setTimeout(async () => {
      try {
        // Generate intelligent response
        const responseText = generateAIResponse(userText, memoryRef.current, userProfileRef.current);
        
        const coachMessage = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          sender: 'Coach',
          timestamp: new Date().toISOString(),
        };
        
        const final = [...updated, coachMessage];
        setMessages(final);
        memoryRef.current.add(responseText, 'Coach');
        await saveMessages(final);
        
        // Update user profile if new info detected
        if (userText.toLowerCase().includes('i play') || userText.toLowerCase().includes('position')) {
          // Simple extraction (improve with NLP library in production)
          const posMatch = userText.match(/\b(goalkeeper|defender|midfielder|winger|striker)\b/i);
          if (posMatch) {
            userProfileRef.current.position = posMatch[1];
          }
        }
        
      } catch (error) {
        console.error('Response failed:', error);
        const fallback = {
          id: (Date.now() + 1).toString(),
          text: `I want to give you the best advice, ${name}! Could you tell me a bit more about what you're working on? 🙌`,
          sender: 'Coach',
          timestamp: new Date().toISOString(),
        };
        setMessages([...updated, fallback]);
      } finally {
        setLoading(false);
        setIsTyping(false);
      }
    }, thinkTime);
  }, [newMessage, isVIP, loading, messages]);
  
  const startNewChat = async () => {
    const { name } = userProfileRef.current;
    const fresh = {
      id: Date.now().toString(),
      text: `Fresh start, ${name}! 💪\n\nWhat's your focus today?\n• Skill drill? (e.g., "help with passing")\n• Mental boost? (e.g., "feeling nervous")\n• Position advice? (e.g., "tips for strikers")\n\nI'm all yours! 🙌`,
      sender: 'Coach',
      timestamp: new Date().toISOString(),
    };
    setMessages([fresh]);
    memoryRef.current = new ConversationMemory();
    memoryRef.current.add(fresh.text, 'Coach');
    await saveMessages([fresh]);
  };
  
  const renderMessage = ({ item }) => {
    const isPlayer = item.sender === 'Player';
    return (
      <View style={[
        styles.messageBubble,
        isPlayer ? styles.playerBubble : styles.coachBubble,
      ]}>
        {!isPlayer && (
          <Text style={styles.senderName}>🤖 {AI_COACH.name}</Text>
        )}
        <Text style={[
          styles.messageText,
          isPlayer ? styles.playerText : styles.coachText,
        ]}>
          {formatMessage(item.text)}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };
  
  // Loading states
  if (checkingVIP) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ffd700" />
          <Text style={styles.loadingText}>Verifying Premium access...</Text>
        </View>
      </View>
    );
  }
  
  if (!isVIP) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.title}>✨ VIP Coach Chat</Text>
          <Text style={styles.subtitle}>Your personal AI football coach</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Personalized drills & advice</Text>
            <Text style={styles.feature}>• Mental game support</Text>
            <Text style={styles.feature}>• Position-specific wisdom</Text>
            <Text style={styles.feature}>• 24/7 availability</Text>
          </View>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.replace('/VIPSubscription')}
          >
            <Text style={styles.upgradeButtonText}>Unlock VIP Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🤖 Coach AI</Text>
          <Text style={styles.headerStatus}>Online • Premium</Text>
        </View>
        <TouchableOpacity onPress={startNewChat} style={styles.iconButton}>
          <Text style={styles.iconText}>🔄</Text>
        </TouchableOpacity>
      </View>
      
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {/* Typing Indicator */}
      {isTyping && <TypingIndicator />}
      
      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Ask Coach AI... (Try: 'help with shooting')"
          placeholderTextColor="#666"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (loading || !newMessage.trim()) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={loading || !newMessage.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Quick Tips */}
      <TouchableOpacity 
        style={styles.tipsBar}
        onPress={() => setNewMessage('/help')}
        activeOpacity={0.7}
      >
        <Text style={styles.tipsText}>💡 Try: "help with passing" • "feeling nervous" • "striker tips"</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

// === 🎨 STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1b263b',
    backgroundColor: '#0d1b2a',
  },
  iconButton: { padding: 8 },
  iconText: { color: '#1e88e5', fontSize: 20, fontWeight: 'bold' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1faee' },
  headerStatus: { fontSize: 12, color: '#4CAF50' },
  
  // VIP Upgrade Screen
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffd700', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 24, textAlign: 'center' },
  featureList: { marginBottom: 32 },
  feature: { fontSize: 14, color: '#f1faee', marginBottom: 8 },
  upgradeButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  upgradeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: { padding: 12 },
  backButtonText: { color: '#a8dadc', fontSize: 14 },
  
  // Messages
  messagesList: { flex: 1 },
  messagesContainer: { padding: 16, paddingBottom: 100 },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
    marginVertical: 6,
    alignSelf: 'flex-start',
  },
  playerBubble: {
    backgroundColor: '#1e88e5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  coachBubble: {
    backgroundColor: '#1b263b',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    color: '#a8dadc',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.9,
  },
  messageText: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 22,
  },
  playerText: { color: '#fff' },
  coachText: { color: '#f1faee' },
  messageTime: {
    color: '#6c757d',
    fontSize: 10,
    opacity: 0.8,
    alignSelf: 'flex-end',
  },
  
  // Typing Indicator
  typingBubble: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingText: {
    color: '#a8dadc',
    fontSize: 13,
    fontStyle: 'italic',
  },
  
  // Input Area
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1b263b',
    backgroundColor: '#0d1b2a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1b263b',
    color: '#f1faee',
    padding: 14,
    borderRadius: 24,
    maxHeight: 120,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a3f5f',
  },
  sendButton: {
    backgroundColor: '#1e88e5',
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  
  // Tips Bar
  tipsBar: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#0d1b2a',
  },
  tipsText: {
    color: '#6c757d',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // Loading
  loadingText: {
    color: '#a8dadc',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});