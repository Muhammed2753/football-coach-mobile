// app/VIPSubscription.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { VIP_PLANS, activateVIP, getVIPTier, isUserVIP, getVIPExpiryDate } from './utils/vipSystem';

export default function VIPSubscription() {
  const router = useRouter();
  const [currentVIP, setCurrentVIP] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);

  useEffect(() => {
    checkVIPStatus();
  }, []);

  const checkVIPStatus = async () => {
    const vip = await isUserVIP();
    if (vip) {
      const tier = await getVIPTier();
      const expiry = await getVIPExpiryDate();
      setCurrentVIP(tier);
      setExpiryDate(expiry);
    }
  };

  const handleSubscribe = async (planType, days) => {
    Alert.alert(
      `Upgrade to ${VIP_PLANS[planType].name}?`,
      `${VIP_PLANS[planType].price} ${VIP_PLANS[planType].duration}`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Subscribe',
          onPress: async () => {
            // In production, integrate with payment gateway (Stripe, RevenueCat, etc.)
            const result = await activateVIP(planType, days);
            if (result.success) {
              Alert.alert('Success!', '🎉 Welcome to VIP!\nEnjoy premium features now!', [
                { text: 'OK', onPress: () => {
                  checkVIPStatus();
                  router.back();
                } }
              ]);
            }
          },
          style: 'default',
        },
      ]
    );
  };

  const FeatureItem = ({ text, included }) => (
    <View style={styles.featureItem}>
      <Text style={styles.featureCheck}>{included ? '✅' : '❌'}</Text>
      <Text style={[styles.featureText, !included && styles.featureDisabled]}>
        {text}
      </Text>
    </View>
  );

  const PlanCard = ({ planType, plan }) => {
    const isCurrentPlan = currentVIP === planType;
    
    return (
      <View style={[
        styles.planCard,
        isCurrentPlan && styles.planCardActive,
        { borderTopColor: plan.color, borderTopWidth: isCurrentPlan ? 5 : 2 }
      ]}>
        {isCurrentPlan && <View style={styles.currentBadge}><Text style={styles.badgeText}>✓ CURRENT</Text></View>}
        
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{plan.price}</Text>
          <Text style={styles.duration}>{plan.duration}</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          {plan.features.map((feature, idx) => (
            <FeatureItem key={idx} text={feature} included={feature.includes('✅')} />
          ))}
        </View>

        {/* Action Button */}
        {!isCurrentPlan && planType !== 'FREE' && (
          <TouchableOpacity
            style={[styles.subscribeBtn, { backgroundColor: plan.color }]}
            onPress={() => handleSubscribe(planType, planType === 'MONTHLY' ? 30 : 365)}
          >
            <Text style={styles.subscribeBtnText}>Subscribe Now</Text>
          </TouchableOpacity>
        )}

        {isCurrentPlan && expiryDate && (
          <View style={styles.expiryBox}>
            <Text style={styles.expiryText}>
              Expires: {expiryDate.toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>⭐ Premium Features</Text>
        <Text style={styles.subtitle}>Unlock VIP and become a champion!</Text>
      </View>

      {currentVIP && (
        <View style={styles.currentStatus}>
          <Text style={styles.statusText}>
            🎉 You're a VIP member! Enjoy premium features!
          </Text>
        </View>
      )}

      {/* Plans */}
      <View style={styles.plansContainer}>
        {Object.entries(VIP_PLANS).map(([key, plan]) => (
          <PlanCard key={key} planType={key} plan={plan} />
        ))}
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.faqTitle}>❓ Common Questions</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Can I cancel anytime?</Text>
          <Text style={styles.faqA}>Yes! Cancel your subscription anytime with no penalties.</Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Will I lose my players?</Text>
          <Text style={styles.faqA}>No! Your players are saved permanently.</Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>What if I'm a student?</Text>
          <Text style={styles.faqA}>Ask us about student discounts at support@footballcoach.app</Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Is there a free trial?</Text>
          <Text style={styles.faqA}>Yes! We offer 7-day free trials for new subscribers.</Text>
        </View>
      </View>

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0d1b2a',
    paddingBottom: 30,
  },
  header: {
    padding: 24,
    backgroundColor: '#1e3a5f',
    borderBottomWidth: 3,
    borderBottomColor: '#FFD700',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a8dadc',
  },
  currentStatus: {
    backgroundColor: '#1b5e20',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  statusText: {
    color: '#a5d6a7',
    fontSize: 14,
    fontWeight: '600',
  },
  plansContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  planCard: {
    backgroundColor: '#1b263b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderTopWidth: 2,
  },
  planCardActive: {
    backgroundColor: '#1a3a52',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  currentBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f1faee',
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  duration: {
    fontSize: 14,
    color: '#a8dadc',
    marginTop: 4,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureCheck: {
    marginRight: 12,
    fontSize: 16,
  },
  featureText: {
    flex: 1,
    color: '#f1faee',
    fontSize: 14,
  },
  featureDisabled: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  subscribeBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  subscribeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  expiryBox: {
    backgroundColor: '#0d1b2a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  expiryText: {
    color: '#a5d6a7',
    fontSize: 14,
    fontWeight: '600',
  },
  faqSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1faee',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#1b263b',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1e88e5',
  },
  faqQ: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e88e5',
    marginBottom: 6,
  },
  faqA: {
    fontSize: 14,
    color: '#a8dadc',
    lineHeight: 20,
  },
  backBtn: {
    backgroundColor: '#1e88e5',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
