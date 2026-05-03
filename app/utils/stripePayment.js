// app/utils/stripePayment.js
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './utils/firebaseConfig',
      plan: plan || null,
      startDate: startDate ? new Date(startDate) : null,
    };
  } catch {
    return { isActive: false, plan: null, startDate: null };
  }
};
