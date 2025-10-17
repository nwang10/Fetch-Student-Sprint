import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface RoastImageProps {
  roastText: string;
  roastEmoji?: string;
  receiptItems?: Array<{ name: string; price: number }>;
}

// Reusable roast image component that displays the AI roast
export default function RoastImage({ roastText, roastEmoji, receiptItems }: RoastImageProps) {
  const displayItems = receiptItems || [];

  return (
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
          <Text style={styles.roastMainText}>{roastText}</Text>
        </View>

        {/* Receipt summary for context */}
        {displayItems.length > 0 && (
          <View style={styles.receiptSummary}>
            <Text style={styles.receiptSummaryTitle}>THE EVIDENCE:</Text>
            <View style={styles.receiptItemsGrid}>
              {displayItems.slice(0, 6).map((item, index) => (
                <View key={index} style={styles.receiptPill}>
                  <Text style={styles.receiptPillText}>{item.name}</Text>
                </View>
              ))}
              {displayItems.length > 6 && (
                <View style={styles.receiptPill}>
                  <Text style={styles.receiptPillText}>+{displayItems.length - 6} more</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      <Text style={styles.roastDisclaimer}>
        ⚠️ This AI roast is based on your actual junk food purchases
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  roastImageContainer: {
    width: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: '#7F1D1D',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
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
