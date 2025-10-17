import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

interface Roast {
  id: number;
  text: string;
  emoji: string;
  color: string;
}

// AI Roast Generator - analyzes receipt contents
function generateRoasts(receiptItems: Array<{ name: string; price: number }>): Roast[] {
  const roasts: Roast[] = [];
  const totalPrice = receiptItems.reduce((sum, item) => sum + item.price, 0);
  const itemNames = receiptItems.map(item => item.name.toLowerCase());

  // Detect receipt type
  const proteinKeywords = ['protein', 'whey', 'muscle', 'pre-workout', 'preworkout', 'creatine'];
  const proteinCount = itemNames.filter(name =>
    proteinKeywords.some(keyword => name.includes(keyword))
  ).length;

  const bulkFoodKeywords = ['gallon', 'lbs', 'pound', 'dozen', 'loaves', 'loaf'];
  const bulkCount = itemNames.filter(name =>
    bulkFoodKeywords.some(keyword => name.includes(keyword))
  ).length;

  const beautyKeywords = ['makeup', 'mascara', 'lipstick', 'foundation', 'moisturizer', 'lotion', 'nail polish', 'serum', 'face mask'];
  const beautyCount = itemNames.filter(name =>
    beautyKeywords.some(keyword => name.includes(keyword))
  ).length;

  const energyKeywords = ['monster', 'red bull', 'energy', '5 hour', 'taquito', 'hot dog', 'slurpee'];
  const energyCount = itemNames.filter(name =>
    energyKeywords.some(keyword => name.includes(keyword))
  ).length;

  const isGymReceipt = proteinCount >= 2;
  const isBulkReceipt = bulkCount >= 3 || receiptItems.length >= 15;
  const isBeautyReceipt = beautyCount >= 3;
  const isLateNightReceipt = energyCount >= 2;

  // GYM RECEIPT ROASTS
  if (isGymReceipt) {
    // Protein overload roast
    if (proteinCount >= 3) {
      roasts.push({
        id: 1,
        text: `${proteinCount} protein products? Bro, you're gonna turn into a protein shake! 💪`,
        emoji: "💪",
        color: "#F59E0B",
      });
    }

    // Pre-workout roast
    if (itemNames.some(name => name.includes('pre-workout') || name.includes('c4'))) {
      roasts.push({
        id: 2,
        text: `Pre-workout? Your heart rate's gonna be higher than your credit score! ⚡`,
        emoji: "⚡",
        color: "#EF4444",
      });
    }

    // Protein bar roast
    const proteinBarCount = itemNames.filter(name =>
      name.includes('bar') || name.includes('quest') || name.includes('built')
    ).length;
    if (proteinBarCount >= 2) {
      roasts.push({
        id: 3,
        text: `${proteinBarCount} types of protein bars? Meal prep = just unwrapping different flavors 🍫`,
        emoji: "🍫",
        color: "#8B5CF6",
      });
    }

    // Resistance bands roast
    if (itemNames.some(name => name.includes('band') || name.includes('strap'))) {
      roasts.push({
        id: 4,
        text: `Wrist straps AND resistance bands? Someone's skipping leg day at the gym AND at home! 🦵`,
        emoji: "🏋️",
        color: "#3B82F6",
      });
    }

    // Protein ice cream/desserts
    if (itemNames.some(name => name.includes('halo top') || name.includes('yasso') || name.includes('ice cream'))) {
      roasts.push({
        id: 5,
        text: `"Healthy" ice cream? Just admit you want dessert and stop lying to yourself! 🍦`,
        emoji: "🍦",
        color: "#EC4899",
      });
    }

    // Total price for gym stuff
    if (totalPrice > 150) {
      roasts.push({
        id: 6,
        text: `$${totalPrice.toFixed(2)} on supplements? That's a gym membership AND a personal trainer! 💸`,
        emoji: "💸",
        color: "#10B981",
      });
    } else if (totalPrice > 200) {
      roasts.push({
        id: 7,
        text: `$${totalPrice.toFixed(2)}!? You're not building muscle, you're building DEBT! 📉`,
        emoji: "📉",
        color: "#DC2626",
      });
    }

    // Variety roast
    if (receiptItems.length >= 8) {
      roasts.push({
        id: 8,
        text: `${receiptItems.length} fitness products? Your cart looks like a GNC exploded! 🧪`,
        emoji: "🧪",
        color: "#F97316",
      });
    }

    // Commitment roast
    roasts.push({
      id: 9,
      text: `This receipt screams "New Year's resolution" energy... it's October! 📅`,
      emoji: "📅",
      color: "#6366F1",
    });

    roasts.push({
      id: 10,
      text: `All this protein but still can't lift your credit card debt! 💳`,
      emoji: "💳",
      color: "#EAB308",
    });

    return roasts;
  }

  // BEAUTY/COSMETICS RECEIPT ROASTS
  if (isBeautyReceipt) {
    // Makeup overload
    const makeupCount = itemNames.filter(name =>
      ['mascara', 'lipstick', 'foundation', 'eyeshadow', 'makeup'].some(k => name.includes(k))
    ).length;
    if (makeupCount >= 3) {
      roasts.push({
        id: 1,
        text: `${makeupCount} makeup items? Someone's got a hot date... or just retail therapy 💄`,
        emoji: "💄",
        color: "#EC4899",
      });
    }

    // Multiple lipsticks
    if (itemNames.some(name => name.includes('lipstick') && (name.includes('5') || name.includes('set')))) {
      roasts.push({
        id: 2,
        text: `5 lipstick colors!? Pick ONE vibe and stick with it! Your lips can't multitask! 💋`,
        emoji: "💋",
        color: "#DC2626",
      });
    }

    // Nail polish addiction
    if (itemNames.some(name => name.includes('nail polish') && name.includes('6'))) {
      roasts.push({
        id: 3,
        text: `6 bottles of nail polish? Your nail salon just called - they're feeling threatened! 💅`,
        emoji: "💅",
        color: "#EC4899",
      });
    }

    // Face masks
    if (itemNames.some(name => name.includes('face mask'))) {
      roasts.push({
        id: 4,
        text: `Face masks? Self-care Sunday turned into self-care SPENDING! 🧖‍♀️`,
        emoji: "🧖‍♀️",
        color: "#A855F7",
      });
    }

    // Expensive serum
    if (itemNames.some(name => name.includes('serum'))) {
      const serumItem = receiptItems.find((item: any) => item.name.toLowerCase().includes('serum'));
      if (serumItem && serumItem.price > 30) {
        roasts.push({
          id: 5,
          text: `$${serumItem.price} on face serum!? That's not skincare, that's a CAR PAYMENT! 💸`,
          emoji: "💸",
          color: "#EF4444",
        });
      }
    }

    // Total price
    if (totalPrice > 200) {
      roasts.push({
        id: 6,
        text: `$${totalPrice.toFixed(2)} at CVS!? Did you buy the ENTIRE beauty aisle!? 🏪`,
        emoji: "🛍️",
        color: "#F59E0B",
      });
    }

    // Impulse shopping
    roasts.push({
      id: 7,
      text: `Walked in for one thing, walked out with 16 items. Classic CVS move! 🎯`,
      emoji: "🎯",
      color: "#8B5CF6",
    });

    // Beauty influencer
    roasts.push({
      id: 8,
      text: `This receipt screams "I watched ONE makeup tutorial and lost control!" 📱`,
      emoji: "📱",
      color: "#06B6D4",
    });

    // Multiple brands
    if (receiptItems.length >= 10) {
      roasts.push({
        id: 9,
        text: `${receiptItems.length} different products? You're not shopping, you're HOARDING beauty supplies! 🏗️`,
        emoji: "🏗️",
        color: "#10B981",
      });
    }

    roasts.push({
      id: 10,
      text: `Plot twist: You're actually flipping beauty products on Facebook Marketplace! 📦`,
      emoji: "📦",
      color: "#F97316",
    });

    return roasts;
  }

  // LATE NIGHT GAS STATION RECEIPT ROASTS
  if (isLateNightReceipt) {
    // Energy drinks
    const energyDrinkCount = itemNames.filter(name =>
      ['monster', 'red bull', '5 hour', 'energy'].some(k => name.includes(k))
    ).length;
    if (energyDrinkCount >= 2) {
      roasts.push({
        id: 1,
        text: `${energyDrinkCount} different energy drinks? Your heart is gonna file a restraining order! 💔`,
        emoji: "⚡",
        color: "#EF4444",
      });
    }

    // Multiple monsters
    if (itemNames.some(name => name.includes('monster') && name.includes('4'))) {
      roasts.push({
        id: 2,
        text: `4 cans of Monster!? Bro, sleep is FREE. This is just expensive insomnia! 😵`,
        emoji: "😵",
        color: "#10B981",
      });
    }

    // Taquitos
    if (itemNames.some(name => name.includes('taquito'))) {
      roasts.push({
        id: 3,
        text: `Gas station taquitos at 2am? Your stomach is BRAVE. Respect the chaos! 🌮`,
        emoji: "🌮",
        color: "#F59E0B",
      });
    }

    // Hot dog
    if (itemNames.some(name => name.includes('hot dog'))) {
      roasts.push({
        id: 4,
        text: `Chili cheese hot dog from 7-Eleven? That's not dinner, that's a CRY FOR HELP! 🌭`,
        emoji: "🌭",
        color: "#DC2626",
      });
    }

    // Slurpee
    if (itemNames.some(name => name.includes('slurpee') || name.includes('big gulp'))) {
      roasts.push({
        id: 5,
        text: `Big Gulp Slurpee? Your brain freeze is gonna have a brain freeze! 🧊`,
        emoji: "🧊",
        color: "#06B6D4",
      });
    }

    // Multiple energy sources
    if (energyDrinkCount >= 2) {
      roasts.push({
        id: 6,
        text: `Energy drinks + 5 Hour Energy? That's not staying awake, that's summoning demons! 👹`,
        emoji: "👹",
        color: "#8B5CF6",
      });
    }

    // Late night timing
    roasts.push({
      id: 7,
      text: `This has "It's 3am and I made poor life choices" written ALL over it! ⏰`,
      emoji: "⏰",
      color: "#6366F1",
    });

    // Beef jerky
    if (itemNames.some(name => name.includes('jerky') || name.includes('slim jim'))) {
      roasts.push({
        id: 8,
        text: `Beef jerky and energy drinks? Someone's pulling an all-nighter... or running from the law! 🏃`,
        emoji: "🚓",
        color: "#F97316",
      });
    }

    // Price check
    if (totalPrice < 50) {
      roasts.push({
        id: 9,
        text: `Only $${totalPrice.toFixed(2)} for pure chaos? That's actually impressive value! 🎰`,
        emoji: "🎰",
        color: "#EC4899",
      });
    }

    roasts.push({
      id: 10,
      text: `Your 7-Eleven run is giving "I'm studying for finals" or "avoiding my responsibilities" 📚`,
      emoji: "📚",
      color: "#EAB308",
    });

    return roasts;
  }

  // BULK/CHURCH FOOD ROASTS
  if (isBulkReceipt) {
    // Feeding an army
    if (receiptItems.length >= 15) {
      roasts.push({
        id: 1,
        text: `${receiptItems.length} items!? Are you feeding a small village or preparing for the apocalypse? 🏘️`,
        emoji: "🏘️",
        color: "#F59E0B",
      });
    }

    // Bulk quantities
    if (itemNames.some(name => name.includes('gallon') && name.includes('15'))) {
      roasts.push({
        id: 2,
        text: `15 GALLONS of milk!? Your fridge is crying right now! 🥛`,
        emoji: "🥛",
        color: "#3B82F6",
      });
    }

    if (itemNames.some(name => name.includes('dozen') && name.includes('20'))) {
      roasts.push({
        id: 3,
        text: `20 dozen eggs? That's 240 eggs! Someone's making an OMELET EMPIRE! 🍳`,
        emoji: "🍳",
        color: "#FCD34D",
      });
    }

    // Bread loaves
    if (itemNames.some(name => name.includes('loaves') || name.includes('12'))) {
      roasts.push({
        id: 4,
        text: `12 loaves of bread? Jesus could NEVER! Now you're just showing off 🍞`,
        emoji: "🍞",
        color: "#D97706",
      });
    }

    // Total price
    if (totalPrice > 500) {
      roasts.push({
        id: 5,
        text: `$${totalPrice.toFixed(2)}!? This isn't grocery shopping, it's a down payment on a house! 🏠`,
        emoji: "🏠",
        color: "#10B981",
      });
    }

    // Costco vibes
    roasts.push({
      id: 6,
      text: `This receipt has major "I shop at Costco with a church budget" energy! ⛪`,
      emoji: "⛪",
      color: "#8B5CF6",
    });

    roasts.push({
      id: 7,
      text: `Plot twist: You're actually running an underground restaurant from your garage! 👨‍🍳`,
      emoji: "👨‍🍳",
      color: "#EC4899",
    });

    return roasts;
  }

  // JUNK FOOD ROASTS (original logic)

  // Roast #1: Check for chips/crisps
  const chipKeywords = ['doritos', 'pringles', 'cheetos', 'chips', 'hot cheetos'];
  const chipCount = itemNames.filter(name =>
    chipKeywords.some(keyword => name.includes(keyword))
  ).length;
  if (chipCount >= 2) {
    roasts.push({
      id: 1,
      text: `${chipCount} different chip brands? Your dentist is gonna love this receipt! 🦷`,
      emoji: "🥔",
      color: "#F59E0B",
    });
  }

  // Roast #2: Check for cookies/sweets
  const cookieKeywords = ['oreo', 'cookie', 'twinkie', 'swiss roll', 'debbie'];
  const cookieCount = itemNames.filter(name =>
    cookieKeywords.some(keyword => name.includes(keyword))
  ).length;
  if (cookieCount >= 2) {
    roasts.push({
      id: 2,
      text: `${cookieCount} different types of cookies? I see you're meal prepping for a sugar coma 🍪`,
      emoji: "🍪",
      color: "#8B5CF6",
    });
  }

  // Roast #3: Check for soda
  const sodaKeywords = ['cola', 'coke', 'pepsi', 'dew', 'mountain dew', 'sprite'];
  const sodaCount = itemNames.filter(name =>
    sodaKeywords.some(keyword => name.includes(keyword))
  ).length;
  if (sodaCount >= 2) {
    roasts.push({
      id: 3,
      text: `Double fisting soda brands? Someone's committed to the no-water lifestyle! 🥤`,
      emoji: "🥤",
      color: "#EF4444",
    });
  } else if (sodaCount === 1) {
    roasts.push({
      id: 3,
      text: `At least you're staying hydrated... with pure sugar! Water is shaking right now 💧`,
      emoji: "💧",
      color: "#3B82F6",
    });
  }

  // Roast #4: Check for candy
  const candyKeywords = ['reese', 'candy', 'chocolate', 'peanut butter cups'];
  const candyCount = itemNames.filter(name =>
    candyKeywords.some(keyword => name.includes(keyword))
  ).length;
  if (candyCount >= 1) {
    roasts.push({
      id: 4,
      text: `Reese's on the receipt? I respect the hustle. Breakfast of champions! 🏆`,
      emoji: "🍫",
      color: "#F97316",
    });
  }

  // Roast #5: Total price check
  if (totalPrice > 50) {
    roasts.push({
      id: 5,
      text: `$${totalPrice.toFixed(2)} on snacks!? You could've bought a vegetable... just ONE! 🥦`,
      emoji: "💸",
      color: "#10B981",
    });
  } else if (totalPrice < 40) {
    roasts.push({
      id: 5,
      text: `Only $${totalPrice.toFixed(2)} for all this chaos? That's actually impressive economics 📊`,
      emoji: "💰",
      color: "#EC4899",
    });
  }

  // Roast #6: Check for Pop-Tarts/pastries
  const pastryKeywords = ['pop-tart', 'pop tart', 'tart', 'pastry'];
  const pastryCount = itemNames.filter(name =>
    pastryKeywords.some(keyword => name.includes(keyword))
  ).length;
  if (pastryCount >= 1) {
    roasts.push({
      id: 6,
      text: `Pop-Tarts? What are you, a college student speedrunning diabetes? 🎓`,
      emoji: "🧁",
      color: "#EC4899",
    });
  }

  // Roast #7: Check number of items (they're ALL junk food)
  if (receiptItems.length >= 10) {
    roasts.push({
      id: 7,
      text: `${receiptItems.length} items of pure chaos! Your grocery cart is basically a gas station 🏪`,
      emoji: "🛒",
      color: "#DC2626",
    });
  }

  // Roast #8: Hot Cheetos specific
  const hotCheetosCount = itemNames.filter(name => name.includes('hot cheetos') || name.includes('flamin')).length;
  if (hotCheetosCount >= 1) {
    roasts.push({
      id: 8,
      text: `Flamin' Hot Cheetos? Your fingers are gonna be red for DAYS. Worth it though 🔥`,
      emoji: "🔥",
      color: "#DC2626",
    });
  }

  // Roast #9: Family size Oreos
  if (itemNames.some(name => name.includes('oreo') && name.includes('family'))) {
    roasts.push({
      id: 9,
      text: `"Family Size" Oreos when you live alone? I see you. No judgment... okay, maybe a little 👀`,
      emoji: "👨‍👩‍👧‍👦",
      color: "#6366F1",
    });
  }

  // Roast #10: Zero nutrition check
  const hasAnyNutrition = itemNames.some(name =>
    ['fruit', 'veggie', 'vegetable', 'salad', 'water', 'juice'].some(healthy => name.includes(healthy))
  );
  if (!hasAnyNutrition) {
    roasts.push({
      id: 10,
      text: `Not a SINGLE nutritious item? Your body is running on pure vibes and preservatives! 😤`,
      emoji: "⚠️",
      color: "#EAB308",
    });
  }

  // Roast #11: Snack variety
  if (receiptItems.length >= 8) {
    roasts.push({
      id: 11,
      text: `This isn't a grocery haul, it's a convenience store robbery! Where's the real food? 🚨`,
      emoji: "🚨",
      color: "#EF4444",
    });
  }

  // Default roast if somehow none match (shouldn't happen with this junk food)
  if (roasts.length === 0) {
    roasts.push({
      id: 12,
      text: `This receipt is a cry for help... but also kinda iconic? 🤷`,
      emoji: "🛍️",
      color: "#6B7280",
    });
  }

  return roasts;
}

export default function ShareRoastScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get receipt data from navigation params
  const storeName = params.storeName as string || 'Unknown Store';
  const receiptItems = params.items ? JSON.parse(params.items as string) : [];

  const [availableRoasts] = useState<Roast[]>(generateRoasts(receiptItems));
  const [selectedRoast, setSelectedRoast] = useState<Roast>(availableRoasts[0]);
  const [shareExternal, setShareExternal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Generate AI roast
    setTimeout(() => {
      // Pick a random roast from AI-generated roasts
      const randomRoast = availableRoasts[Math.floor(Math.random() * availableRoasts.length)];
      setSelectedRoast(randomRoast);
      setIsGenerating(false);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1500);
  }, []);

  const regenerateRoast = () => {
    setIsGenerating(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        const currentIndex = availableRoasts.findIndex(r => r.id === selectedRoast.id);
        const nextIndex = (currentIndex + 1) % availableRoasts.length;
        setSelectedRoast(availableRoasts[nextIndex]);
        setIsGenerating(false);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, 1000);
    });
  };

  const handlePost = () => {
    router.push({
      pathname: '/feed',
      params: {
        newPost: JSON.stringify({
          type: 'roast',
          roastText: selectedRoast.text,
          roastEmoji: selectedRoast.emoji,
          roastColor: selectedRoast.color,
          shareExternal,
        }),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/scan-results')}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt Roast</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={isGenerating}
          style={[styles.postButton, isGenerating && styles.postButtonDisabled]}
        >
          <Text
            style={[
              styles.postButtonText,
              isGenerating && styles.postButtonTextDisabled,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* AI Label */}
        <View style={styles.aiLabel}>
          <Text style={styles.aiLabelEmoji}>🤖</Text>
          <Text style={styles.aiLabelText}>AI-Generated Roast</Text>
        </View>

        {/* AI Roast Display - Intense visual roast */}
        {!isGenerating && (
          <View style={styles.roastImageContainer}>
            {/* Intense background effect */}
            <View style={styles.roastBackground}>
              <Text style={styles.backgroundEmoji}>🔥</Text>
              <Text style={styles.backgroundEmoji}>💀</Text>
              <Text style={styles.backgroundEmoji}>🔥</Text>
            </View>

            {/* Main roast content */}
            <View style={styles.roastContent}>
              <Text style={styles.roastLabel}>🤖 AI ROAST</Text>
              <View style={styles.roastTextBox}>
                <Text style={styles.intensityIndicator}>ROAST LEVEL: MAXIMUM 🔥🔥🔥</Text>
                <Text style={styles.roastMainText}>{selectedRoast.text}</Text>
              </View>

              {/* Receipt summary for context */}
              <View style={styles.receiptSummary}>
                <Text style={styles.receiptSummaryTitle}>THE EVIDENCE:</Text>
                <View style={styles.receiptItemsGrid}>
                  {receiptItems.slice(0, 6).map((item: any, index: number) => (
                    <View key={index} style={styles.receiptPill}>
                      <Text style={styles.receiptPillText}>{item.name}</Text>
                    </View>
                  ))}
                  {receiptItems.length > 6 && (
                    <View style={styles.receiptPill}>
                      <Text style={styles.receiptPillText}>+{receiptItems.length - 6} more</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.roastDisclaimer}>
              ⚠️ This AI roast is based on your actual junk food purchases
            </Text>
          </View>
        )}

        {/* Roast Card */}
        <View style={styles.roastCardContainer}>
          {isGenerating ? (
            <View style={styles.loadingCard}>
              <Animated.Text
                style={[
                  styles.loadingEmoji,
                  {
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              >
                🔥
              </Animated.Text>
              <Text style={styles.loadingText}>Analyzing your receipt...</Text>
              <Text style={styles.loadingSubtext}>Preparing the perfect roast</Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.roastCard,
                { backgroundColor: selectedRoast.color + '20', opacity: fadeAnim },
              ]}
            >
              <Text style={styles.roastEmoji}>{selectedRoast.emoji}</Text>
              <Text style={styles.roastText}>{selectedRoast.text}</Text>

              <TouchableOpacity
                style={[
                  styles.regenerateButton,
                  { backgroundColor: selectedRoast.color },
                ]}
                onPress={regenerateRoast}
              >
                <Text style={styles.regenerateEmoji}>🔄</Text>
                <Text style={styles.regenerateText}>Generate Another</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Share External Toggle */}
        {!isGenerating && (
          <>
            <View style={styles.externalShareContainer}>
              <View style={styles.externalShareInfo}>
                <Text style={styles.externalShareTitle}>
                  Share to TikTok/Instagram
                </Text>
                <Text style={styles.externalShareSubtitle}>
                  +10 bonus points
                </Text>
              </View>
              <Switch
                value={shareExternal}
                onValueChange={setShareExternal}
                trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Points Info */}
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsInfoEmoji}>😂</Text>
              <View style={styles.pointsInfoText}>
                <Text style={styles.pointsInfoTitle}>You'll earn</Text>
                <Text style={styles.pointsInfoValue}>
                  {shareExternal ? '40' : '30'} Fetch Points
                </Text>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                💡 Your roast is based on your recent purchases. Share it with friends and earn bonus points!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    fontSize: 24,
    color: '#111827',
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  postButtonTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aiLabelEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  aiLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  roastCardContainer: {
    marginBottom: 24,
    minHeight: 300,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  roastCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#EF4444',
  },
  roastEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  roastText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 32,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  regenerateEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  regenerateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  externalShareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  externalShareInfo: {
    flex: 1,
  },
  externalShareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  externalShareSubtitle: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  pointsInfoEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  pointsInfoText: {
    flex: 1,
  },
  pointsInfoTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  pointsInfoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  infoCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  roastImageContainer: {
    marginBottom: 24,
    backgroundColor: '#DC2626',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#7F1D1D',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  roastBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    opacity: 0.1,
  },
  backgroundEmoji: {
    fontSize: 100,
    color: '#000000',
  },
  roastContent: {
    padding: 24,
  },
  roastLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FEE2E2',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
  },
  roastTextBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  intensityIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FCA5A5',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  roastMainText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  receiptSummary: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  receiptSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FCD34D',
    marginBottom: 12,
    letterSpacing: 1,
  },
  receiptItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  receiptPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  receiptPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  roastDisclaimer: {
    fontSize: 11,
    color: '#FEE2E2',
    textAlign: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    fontStyle: 'italic',
  },
});
