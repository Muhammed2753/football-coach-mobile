import { useState, useEffect } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useVIPStatus } from './useVIPStatus';

const INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-3609023299103795/2170817040';

export function useInterstitialAd() {
  const { isVIP } = useVIPStatus();
  const [interstitial] = useState(() =>
    InterstitialAd.createForAdRequest(
      __DEV__ ? TestIds.INTERSTITIAL : INTERSTITIAL_AD_UNIT_ID,
      { requestNonPersonalizedAdsOnly: false }
    )
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isVIP) return;

    const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => setLoaded(false));
    const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      interstitial.load();
    });

    interstitial.load();

    return () => {
      unsubLoaded();
      unsubError();
      unsubClosed();
    };
  }, [isVIP]);

  const show = () => {
    if (isVIP || !loaded) return false;
    interstitial.show();
    return true;
  };

  return { show, loaded };
}