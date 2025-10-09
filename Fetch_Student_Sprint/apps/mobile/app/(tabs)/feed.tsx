import React, { useCallback, useRef, useState } from 'react';
import { View, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useFlips, useLikeFlip } from '../../src/hooks/useFlips';
import { FlipCard } from '../../src/components/FlipCard';
import { Flip } from '@repo/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedScreen() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFlips();
  const likeMutation = useLikeFlip();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const flips = data?.pages.flatMap((page) => page) ?? [];

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const handleLike = useCallback(
    (flip: Flip) => {
      likeMutation.mutate({ flipId: flip.id, isLiked: flip.isLiked });
    },
    [likeMutation]
  );

  const handleComment = useCallback((flip: Flip) => {
    // TODO: Navigate to comments screen
    console.log('Comment on flip:', flip.id);
  }, []);

  const handleShare = useCallback((flip: Flip) => {
    // TODO: Open share modal
    console.log('Share flip:', flip.id);
  }, []);

  const handleJoinChallenge = useCallback((flip: Flip) => {
    // TODO: Navigate to challenge screen
    console.log('Join challenge:', flip.challengeId);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: Flip; index: number }) => (
      <View style={{ height: SCREEN_HEIGHT }}>
        <FlipCard
          flip={item}
          onLike={() => handleLike(item)}
          onComment={() => handleComment(item)}
          onShare={() => handleShare(item)}
          onJoinChallenge={() => handleJoinChallenge(item)}
          isActive={index === activeIndex}
        />
      </View>
    ),
    [activeIndex, handleLike, handleComment, handleShare, handleJoinChallenge]
  );

  const keyExtractor = useCallback((item: Flip) => item.id, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" testID="feed-screen">
      <FlatList
        ref={flatListRef}
        data={flips}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="h-24 items-center justify-center">
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
