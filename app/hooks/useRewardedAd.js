import { useState, useEffect } from 'react';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useVIPStatus } from './useVIPStatus';

// Your Rewarded Ad Unit ID
const REWARDED_AD_UNIT_ID = 'ca-app-pub-3609023299103795/5128672390';

export function useRewardedAd() {
  const { isVIP } = useVIPStatus();
  const [rewarded, setRewarded] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [reward, setReward] = useState(null);

  useEffect(() => {
    if (isVIP) return; // Don't load ads for VIP users

    const ad = RewardedAd.createForAdRequest(
      __DEV__ ? TestIds.REWARDED : REWARDED_AD_UNIT_ID,
      {
        requestNonPersonalizedAdsOnly: false,
      }
    );

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubError = ad.addAdEventListener(RewardedAdEventType.ERROR, () => {
      setLoaded(false);
    });

    const unsubReward = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (rewardData) => {
      console.log('User earned reward:', rewardData);
      setReward(rewardData);
    });

    ad.load();
    setRewarded(ad);

    return () => {
      unsubLoaded();
      unsubError();
      unsubReward();
    };
  }, [isVIP]);

  const show = (onReward) => {
    if (!loaded || !rewarded || isVIP) {
      console.log('Rewarded ad not shown: VIP=', isVIP, 'Loaded=', loaded);
      return false;
    }
    
    const unsubReward = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (rewardData) => {
        onReward?.(rewardData);
      }
    );

    rewarded.show();
    setLoaded(false);
    
    // Reload after showing
    setTimeout(() => {
      rewarded.load();
      unsubReward();
    }, 1000);
    
    return true;
  };

  return { show, loaded, reward };
}