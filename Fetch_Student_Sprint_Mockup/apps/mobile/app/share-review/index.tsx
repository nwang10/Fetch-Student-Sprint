import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ShareReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get receipt data from navigation params
  const storeName = params.storeName as string || 'Unknown Store';
  const receiptItems = params.items ? JSON.parse(params.items as string) : [];

  const RECEIPT_ITEMS = receiptItems.map((item: any, index: number) => ({
    id: index + 1,
    name: item.name,
    price: item.price,
  }));

  const [reviewMode, setReviewMode] = useState<'single' | 'multiple' | 'trip'>('single');
  const [selectedItems, setSelectedItems] = useState<number[]>([0]); // Array of indices
  const [selectedItem, setSelectedItem] = useState(RECEIPT_ITEMS[0]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [shareExternal, setShareExternal] = useState(false);
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);

  // Handle media returned from review-camera and restore form data
  useEffect(() => {
    if (params.media && params.mediaType) {
      setMedia(params.media as string);
      setMediaType(params.mediaType as 'photo' | 'video');
    }

    // Restore form data from params if returning from camera
    if (params.selectedItemId) {
      const item = RECEIPT_ITEMS.find(i => i.id === Number(params.selectedItemId));
      if (item) setSelectedItem(item);
    }
    if (params.rating) {
      setRating(Number(params.rating));
    }
    if (params.reviewText) {
      setReviewText(params.reviewText as string);
    }
    if (params.shareExternal) {
      setShareExternal(params.shareExternal === 'true');
    }
  }, [params.media, params.mediaType, params.selectedItemId, params.rating, params.reviewText, params.shareExternal]);

  const openCamera = (mode: 'photo' | 'video') => {
    // Save current form state before navigating to camera
    router.push({
      pathname: '/review-camera',
      params: {
        mode,
        // Pass current form data to preserve it
        selectedItemId: selectedItem.id.toString(),
        rating: rating.toString(),
        reviewText,
        shareExternal: shareExternal.toString(),
      },
    });
  };

  const toggleItemSelection = (index: number) => {
    if (reviewMode === 'single') {
      setSelectedItems([index]);
      setSelectedItem(RECEIPT_ITEMS[index]);
    } else if (reviewMode === 'multiple') {
      if (selectedItems.includes(index)) {
        const newSelected = selectedItems.filter(i => i !== index);
        setSelectedItems(newSelected.length > 0 ? newSelected : [index]);
      } else {
        setSelectedItems([...selectedItems, index]);
      }
    }
  };

  const getProductName = () => {
    if (reviewMode === 'trip') {
      return `${storeName} Shopping Trip`;
    } else if (reviewMode === 'multiple') {
      const items = selectedItems.map(i => RECEIPT_ITEMS[i].name);
      return items.length > 2 ? `${items[0]} & ${items.length - 1} others` : items.join(' & ');
    }
    return selectedItem.name;
  };

  const handlePost = () => {
    router.push({
      pathname: '/feed',
      params: {
        newPost: JSON.stringify({
          type: 'review',
          productName: getProductName(),
          rating,
          reviewText: reviewText || `Great ${reviewMode === 'trip' ? 'shopping experience' : 'product'}! ${rating}/5 stars!`,
          shareExternal,
          media,
          mediaType,
          storeName,
          receiptItems: RECEIPT_ITEMS,
          reviewMode,
        }),
      },
    });
  };

  const canPost = rating > 0 && (reviewMode === 'trip' || (reviewMode === 'single' && selectedItem) || (reviewMode === 'multiple' && selectedItems.length > 0));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/scan-results')}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Review</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!canPost}
          style={[styles.postButton, !canPost && styles.postButtonDisabled]}
        >
          <Text
            style={[
              styles.postButtonText,
              !canPost && styles.postButtonTextDisabled,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Review Mode Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to review?</Text>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, reviewMode === 'single' && styles.modeButtonActive]}
              onPress={() => {
                setReviewMode('single');
                setSelectedItems([0]);
              }}
            >
              <Text style={[styles.modeButtonText, reviewMode === 'single' && styles.modeButtonTextActive]}>
                Single Item
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, reviewMode === 'multiple' && styles.modeButtonActive]}
              onPress={() => {
                setReviewMode('multiple');
                setSelectedItems([0]);
              }}
            >
              <Text style={[styles.modeButtonText, reviewMode === 'multiple' && styles.modeButtonTextActive]}>
                Multiple Items
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, reviewMode === 'trip' && styles.modeButtonActive]}
              onPress={() => setReviewMode('trip')}
            >
              <Text style={[styles.modeButtonText, reviewMode === 'trip' && styles.modeButtonTextActive]}>
                Whole Trip
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Select Product */}
        {reviewMode !== 'trip' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {reviewMode === 'multiple' ? 'Select Products (tap to select multiple)' : 'Select a Product'}
            </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.itemsScroll}
            contentContainerStyle={styles.itemsScrollContent}
          >
            {RECEIPT_ITEMS.map((item, index) => {
              const isSelected = reviewMode === 'single'
                ? selectedItem.id === item.id
                : selectedItems.includes(index);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.itemCard,
                    isSelected && styles.itemCardSelected,
                  ]}
                  onPress={() => toggleItemSelection(index)}
                >
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        )}

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate this Product</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Text style={styles.starEmoji}>
                  {star <= rating ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && "Not great 😕"}
              {rating === 2 && "Could be better 🤔"}
              {rating === 3 && "It's okay 😊"}
              {rating === 4 && "Pretty good! 👍"}
              {rating === 5 && "Amazing! 🌟"}
            </Text>
          )}
        </View>

        {/* Review Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Write Your Review (Optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Loved these oat cookies — 9/10!"
            placeholderTextColor="#9CA3AF"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            maxLength={150}
            returnKeyType="done"
            blurOnSubmit={true}
          />
          <Text style={styles.charCount}>{reviewText.length}/150</Text>
        </View>

        {/* Add Photo or Video */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photo or Video (Optional)</Text>

          {media ? (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: media }} style={styles.mediaPreview} />
              <View style={styles.mediaOverlay}>
                <Text style={styles.mediaType}>
                  {mediaType === 'video' ? '🎥 Video' : '📸 Photo'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => {
                  setMedia(null);
                  setMediaType(null);
                }}
              >
                <Text style={styles.removeMediaText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mediaButtons}>
              <TouchableOpacity style={styles.mediaButton} onPress={() => openCamera('photo')}>
                <Text style={styles.mediaButtonEmoji}>📸</Text>
                <Text style={styles.mediaButtonText}>Add Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mediaButton} onPress={() => openCamera('video')}>
                <Text style={styles.mediaButtonEmoji}>🎥</Text>
                <Text style={styles.mediaButtonText}>Add Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Share External Toggle */}
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
            trackColor={{ false: '#D1D5DB', true: '#F59E0B' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Points Info */}
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsInfoEmoji}>⭐</Text>
          <View style={styles.pointsInfoText}>
            <Text style={styles.pointsInfoTitle}>You'll earn</Text>
            <Text style={styles.pointsInfoValue}>
              {shareExternal ? '50' : '40'} Fetch Points
            </Text>
          </View>
        </View>

        {/* Preview Card */}
        {rating > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewProductName}>{selectedItem.name}</Text>
                <View style={styles.previewRating}>
                  {[...Array(rating)].map((_, i) => (
                    <Text key={i} style={styles.previewStar}>⭐</Text>
                  ))}
                </View>
              </View>
              {reviewText && (
                <Text style={styles.previewReviewText}>"{reviewText}"</Text>
              )}
              <View style={styles.previewFooter}>
                <Text style={styles.previewAuthor}>You</Text>
                <Text style={styles.previewPoints}>+40 Points</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#F59E0B',
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modeButtonTextActive: {
    color: '#F59E0B',
  },
  itemsScroll: {
    marginHorizontal: -20,
  },
  itemsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minWidth: 160,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  itemCardSelected: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  starButton: {
    padding: 4,
  },
  starEmoji: {
    fontSize: 48,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 12,
  },
  reviewInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'right',
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
    color: '#F59E0B',
    fontWeight: '600',
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
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
    color: '#F59E0B',
  },
  previewSection: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  previewRating: {
    flexDirection: 'row',
    gap: 4,
  },
  previewStar: {
    fontSize: 20,
  },
  previewReviewText: {
    fontSize: 16,
    color: '#1F2937',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 24,
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  previewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  previewPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  mediaButtonEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  mediaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mediaContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mediaType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
