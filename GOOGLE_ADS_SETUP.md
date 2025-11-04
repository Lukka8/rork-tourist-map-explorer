# Google Ads Implementation Guide

## Current Implementation

The app currently has **placeholder ad components** that display mock advertisements. These demonstrate where ads will appear but don't show real ads yet.

### Ad Components Implemented:

1. **AdBanner** (`components/AdBanner.tsx`)
   - Banner ads (50px height)
   - Large banner ads (100px height) 
   - Medium rectangle ads (250px height)
   - Used in: Map screen (every 3rd attraction view), Profile screen

2. **AdInterstitial** (`components/AdInterstitial.tsx`)
   - Full-screen ads with countdown timer
   - Used in: Profile screen (every 4th attraction click)

3. **AdRewarded** (`components/AdRewarded.tsx`)
   - Rewarded video ads with progress tracking
   - Can be integrated for premium features or in-app currency

## Ad Placement Strategy

### Map Screen (`app/(tabs)/(map)/index.tsx`)
- **Banner Ad**: Displays in attraction detail cards after every 3 views
- Size: Medium rectangle (250px)
- Trigger: Counter-based, increments on marker press

### Profile Screen (`app/(tabs)/(profile)/index.tsx`)
- **Banner Ad**: Fixed banner at top of favorites/visited list
- Size: Standard banner (50px)
- **Interstitial Ad**: Shows every 4 clicks when viewing attraction details
- Auto-closes after 5 seconds with countdown

## To Integrate Real Google Ads

### Step 1: Setup Google AdMob Account
1. Go to [AdMob](https://admob.google.com/)
2. Create an account and register your app
3. Get your App ID, Banner Ad Unit ID, Interstitial Ad Unit ID, and Rewarded Ad Unit ID

### Step 2: Install Required Package
Since you're using Expo, you'll need to use a custom development build:

```bash
npx expo install react-native-google-mobile-ads
```

### Step 3: Configure app.json
Add the AdMob configuration:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx",
          "iosAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
        }
      ]
    ]
  }
}
```

### Step 4: Create Custom Development Build
```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

Note: Google Mobile Ads doesn't work with Expo Go, you need a custom development build.

### Step 5: Update Ad Components

Replace placeholder components with real ad implementations:

#### Example: Banner Ad
```typescript
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export function AdBanner() {
  const adUnitId = __DEV__ 
    ? TestIds.BANNER 
    : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy';

  return (
    <BannerAd
      unitId={adUnitId}
      size={BannerAdSize.BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
}
```

#### Example: Interstitial Ad
```typescript
import { InterstitialAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';

const interstitial = InterstitialAd.createForAdRequest(
  __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy'
);

// Load the ad
interstitial.load();

// Show when ready
interstitial.addAdEventListener(AdEventType.LOADED, () => {
  interstitial.show();
});
```

#### Example: Rewarded Ad
```typescript
import { RewardedAd, TestIds, RewardedAdEventType } from 'react-native-google-mobile-ads';

const rewarded = RewardedAd.createForAdRequest(
  __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy'
);

rewarded.load();

rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
  rewarded.show();
});

rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
  console.log('User earned reward of', reward);
});
```

## Best Practices

### 1. Ad Frequency
- Don't show ads too frequently (current: every 3-4 user actions)
- Respect user experience over ad revenue
- Consider implementing ad-free premium option

### 2. Ad Placement
- Natural breaks in content (between sections, after actions)
- Full-screen ads after completing actions
- Banner ads in scrollable content

### 3. Testing
- Always use test ad unit IDs during development
- Test on real devices before publishing
- Verify ads don't crash the app

### 4. Privacy & Compliance
- Add privacy policy to your app
- Implement GDPR consent if targeting EU users
- Follow Google AdMob policies
- Consider user consent for personalized ads

### 5. Performance
- Preload interstitial and rewarded ads
- Don't block app functionality while loading ads
- Handle ad load failures gracefully

## Revenue Optimization Tips

1. **Ad Mediation**: Use AdMob mediation to maximize fill rate
2. **Strategic Placement**: Test different placements with A/B testing
3. **Ad Format Mix**: Use variety (banner, interstitial, rewarded)
4. **User Segments**: Different strategies for free vs premium users
5. **Analytics**: Track metrics (CTR, eCPM, fill rate)

## Current Implementation Status

✅ Ad placeholder components created  
✅ Strategic ad placements implemented  
✅ User interaction tracking (view/click counters)  
✅ Countdown timers and user experience flow  
⏳ Real Google AdMob integration (requires custom build)  
⏳ Ad revenue tracking  
⏳ Privacy policy and consent management  

## Next Steps

1. Create custom Expo development build
2. Set up Google AdMob account
3. Replace placeholder components with real ads
4. Test on physical devices
5. Implement user consent for ads
6. Add privacy policy
7. Submit for app store review

## Resources

- [Google AdMob Documentation](https://developers.google.com/admob)
- [react-native-google-mobile-ads](https://github.com/invertase/react-native-google-mobile-ads)
- [Expo Custom Development Builds](https://docs.expo.dev/development/build/)
- [AdMob Policy Center](https://support.google.com/admob/answer/6128543)
