import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import ShareToFeedModal from '../components/ShareToFeedModal';

interface ReceiptItem {
  name: string;
  price: number;
  points: number;
}

// Hardcoded receipt data
const RECEIPT_DATA: ReceiptItem[] = [
  { name: 'Organic Bananas', price: 3.49, points: 5 },
  { name: 'Whole Milk (1 Gallon)', price: 4.99, points: 8 },
  { name: 'Greek Yogurt', price: 5.99, points: 10 },
  { name: 'Bread - Whole Wheat', price: 3.29, points: 5 },
  { name: 'Eggs (Dozen)', price: 4.49, points: 7 },
  { name: 'Orange Juice', price: 5.49, points: 9 },
  { name: 'Chicken Breast (2 lbs)', price: 12.99, points: 15 },
  { name: 'Mixed Salad Greens', price: 4.29, points: 6 },
  { name: 'Tomatoes', price: 3.99, points: 5 },
  { name: 'Pasta - Penne', price: 2.49, points: 4 },
];

const TOTAL_POINTS = RECEIPT_DATA.reduce((sum, item) => sum + item.points, 0);
const TOTAL_PRICE = RECEIPT_DATA.reduce((sum, item) => sum + item.price, 0);

export default function ScanResultsScreen() {
  const router = useRouter();
  const [showItems, setShowItems] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const itemFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the points display
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Show items after a delay
    setTimeout(() => {
      setShowItems(true);
    }, 800);
  }, []);

  useEffect(() => {
    if (showItems) {
      Animated.timing(itemFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [showItems]);

  const handleShareOption = (option: 'haul' | 'roast' | 'review') => {
    if (option === 'haul') {
      router.push('/share-haul');
    } else if (option === 'roast') {
      router.push('/share-roast');
    } else if (option === 'review') {
      router.push('/share-review');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.push('/feed')}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt Scanned!</Text>
      </View>

      {/* Points Card - Always Visible */}
      <Animated.View
        style={[
          styles.pointsCardFixed,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.pointsHeader}>
          <Text style={styles.pointsEmoji}>🎉</Text>
          <Text style={styles.pointsTitle}>Points Earned</Text>
        </View>
        <Text style={styles.pointsValue}>{TOTAL_POINTS}</Text>
        <Text style={styles.pointsSubtext}>Fetch Points</Text>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Receipt Summary */}
        {showItems && (
          <Animated.View style={[styles.receiptCard, { opacity: itemFadeAnim }]}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>Receipt Details</Text>
              <View style={styles.receiptStoreBadge}>
                <Text style={styles.receiptStoreText}>Target</Text>
              </View>
            </View>

            <View style={styles.receiptInfo}>
              <Text style={styles.receiptDate}>Today • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
              <Text style={styles.receiptItemCount}>{RECEIPT_DATA.length} items</Text>
            </View>

            {/* Items List */}
            <View style={styles.itemsList}>
              {RECEIPT_DATA.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.itemPointsBadge}>
                    <Text style={styles.itemPoints}>+{item.points}</Text>
                  </View>
                </View>
              ))}

              {/* Total */}
              <View style={styles.totalRow}>
                <View style={styles.totalInfo}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalPrice}>${TOTAL_PRICE.toFixed(2)}</Text>
                </View>
                <View style={styles.totalPointsBadge}>
                  <Text style={styles.totalPoints}>+{TOTAL_POINTS}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        {showItems && (
          <Animated.View style={[styles.actionsContainer, { opacity: itemFadeAnim }]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowShareModal(true)}
            >
              <Text style={styles.primaryButtonText}>Share to Feed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/feed')}
            >
              <Text style={styles.secondaryButtonText}>Back to Feed</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Share to Feed Modal */}
      <ShareToFeedModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSelectOption={handleShareOption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeButtonText: {
    color: '#111827',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  pointsCardFixed: {
    backgroundColor: '#7C3AED',
    borderRadius: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  pointsCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsEmoji: {
    fontSize: 32,
    marginRight: 8,
  },
  pointsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pointsValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pointsSubtext: {
    fontSize: 18,
    color: '#EDE9FE',
    fontWeight: '500',
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  receiptStoreBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  receiptStoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  receiptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  receiptDate: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  receiptItemCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemPointsBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  itemPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalInfo: {
    flex: 1,
    marginRight: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalPointsBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  totalPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
});
