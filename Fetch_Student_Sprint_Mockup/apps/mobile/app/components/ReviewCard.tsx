import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ReceiptItem {
  name: string;
  price: number;
}

interface ReviewCardProps {
  productName: string;
  rating: number;
  reviewText: string;
  mediaUri?: string;
  storeName?: string;
  receiptItems?: ReceiptItem[];
}

export default function ReviewCard({ productName, rating, reviewText, mediaUri, storeName, receiptItems }: ReviewCardProps) {
  return (
    <View style={styles.container}>
      {/* Fetch Review Badge */}
      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>⭐</Text>
          <Text style={styles.badgeText}>Fetch Review</Text>
        </View>
      </View>

      {/* Store Badge */}
      {storeName && (
        <View style={styles.storeContainer}>
          <Text style={styles.storeIcon}>🏪</Text>
          <Text style={styles.storeText}>Purchased at {storeName}</Text>
        </View>
      )}

      {/* Receipt Items List */}
      {receiptItems && receiptItems.length > 0 && (
        <View style={styles.receiptItemsContainer}>
          <Text style={styles.receiptItemsTitle}>Receipt Items ({receiptItems.length})</Text>
          <View style={styles.receiptItemsList}>
            {receiptItems.slice(0, 5).map((item, index) => (
              <View key={index} style={styles.receiptItemRow}>
                <Text style={styles.receiptItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.receiptItemPrice}>${item.price.toFixed(2)}</Text>
              </View>
            ))}
            {receiptItems.length > 5 && (
              <Text style={styles.moreItemsText}>+ {receiptItems.length - 5} more items</Text>
            )}
          </View>
        </View>
      )}

      {/* Product Image (if available) */}
      {mediaUri && (
        <Image source={{ uri: mediaUri }} style={styles.productImage} resizeMode="cover" />
      )}

      {/* Review Content */}
      <View style={styles.contentContainer}>
        {/* Product Name */}
        <Text style={styles.productName}>{productName}</Text>

        {/* Star Rating */}
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Text key={i} style={styles.star}>
              {i < rating ? '⭐' : '☆'}
            </Text>
          ))}
          <Text style={styles.ratingText}>{rating}.0</Text>
        </View>

        {/* Review Text */}
        {reviewText && (
          <View style={styles.reviewTextContainer}>
            <Text style={styles.quoteIcon}>"</Text>
            <Text style={styles.reviewText}>{reviewText}</Text>
            <Text style={styles.quoteIcon}>"</Text>
          </View>
        )}

        {/* Verified Badge */}
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedIcon}>✓</Text>
          <Text style={styles.verifiedText}>Verified Purchase</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeContainer: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeIcon: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storeContainer: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  storeIcon: {
    fontSize: 16,
  },
  storeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#FEF3C7',
  },
  contentContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  star: {
    fontSize: 24,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginLeft: 8,
  },
  reviewTextContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    marginBottom: 16,
  },
  quoteIcon: {
    fontSize: 24,
    color: '#F59E0B',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  reviewText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    fontStyle: 'italic',
    marginHorizontal: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedIcon: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  verifiedText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  receiptItemsContainer: {
    backgroundColor: '#FFFBEB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  receiptItemsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  receiptItemsList: {
    gap: 6,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptItemName: {
    flex: 1,
    fontSize: 13,
    color: '#78350F',
    marginRight: 8,
  },
  receiptItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  moreItemsText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#A16207',
    marginTop: 4,
  },
});
