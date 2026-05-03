// app/utils/paymentProcessor.js
// IMPORTANT: Raw card numbers are NEVER sent to any server.
// Card data is tokenized client-side via Stripe before any network call.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { activateVIP } from '../utils/payment';
import { startCheckout } from './utils/payment');
    if (!transactions) return [];
    const parsed = JSON.parse(transactions);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return parsed.filter(t => new Date(t.timestamp) > oneHourAgo);
  } catch (error) {
    return [];
  }
};