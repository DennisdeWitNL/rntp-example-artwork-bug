import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import TrackPlayer, { useActiveTrack } from 'react-native-track-player';

import {
  Button,
  OptionSheet,
  ActionSheet,
  PlayerControls,
  Progress,
  Spacer,
  TrackInfo,
} from './components';
import { QueueInitialTracksService, SetupService } from './services';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { SponsorCard } from './components/SponsorCard';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Inner />
    </GestureHandlerRootView>
  );
}

const Inner: React.FC = () => {
  const track = useActiveTrack();
  const isPlayerReady = useSetupPlayer();

  // options bottom sheet
  const optionsSheetRef = useRef<BottomSheet>(null);
  const optionsSheetSnapPoints = useMemo(() => ['40%'], []);
  const handleOptionsPress = useCallback(() => {
    optionsSheetRef.current?.snapToIndex(0);
  }, [optionsSheetRef]);

  // actions bottom sheet
  const actionsSheetRef = useRef<BottomSheet>(null);
  const actionsSheetSnapPoints = useMemo(() => ['40%'], []);
  const handleActionsPress = useCallback(() => {
    actionsSheetRef.current?.snapToIndex(0);
  }, [actionsSheetRef]);



const fetchNowPlaying = async () => {

  const Promise = Math.random().toString(36).substring(7)
  
  const resp = await fetch(
   `https://live-streams.nl/40rocknowplaying/nowplaying.txt?promise=${Promise}`,
 );
 const SplitInfo = await resp.text();
 var splittedData = SplitInfo.split(" - ");
 var artist = splittedData[0];
 var title = splittedData[1];
  
  return (
    {
      "show_name": "40Rock",
      "dj_name": "40Rock",
      "dj_artwork": "https://live-streams.nl/40rocknowplaying/R40RockLogo.jpg",
      "song_artist": artist,
      "song_title": title,
      "song_artwork": "https://live-streams.nl/40rocknowplaying/R40RockLogo.jpg",
      "header_url": ""
  }
  );
}

const onUpdateCurrentTrackMetadata = async () => {
  const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
  let songDataFunction = await fetchNowPlaying();
  if (currentTrackIndex !== undefined) {
    const randomTitle = Math.random().toString(36).substring(7);
    await TrackPlayer.updateMetadataForTrack(currentTrackIndex, {
      title: randomTitle,
      artist: songDataFunction.song_artist,
      artwork: 'https://live-streams.nl/40rocknowplaying/R40RockLogo.jpg'
      // duration: Math.floor(Math.random()),
    });
  }
};

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      console.log('deepLinkHandler', data.url);


        const interval = setInterval(() => {
          console.log("Rerendering stream...")
          onUpdateCurrentTrackMetadata();
        }, 10000);
        return () => clearInterval(interval);
    }

    

    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    // When you launch the closed app from the notification or any other link
    Linking.getInitialURL().then((url) => console.log('getInitialURL', url));

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isPlayerReady) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.contentContainer}>
        <View style={styles.topBarContainer}>
          <Button title="Options" onPress={handleOptionsPress} type="primary" />
          <Button title="Actions" onPress={handleActionsPress} type="primary" />
        </View>
        <TrackInfo track={track} />
        <Progress live={track?.isLiveStream} />
        <Spacer />
        <PlayerControls />
        <Spacer mode={'expand'} />
        <SponsorCard />
      </View>
      <BottomSheet
        index={-1}
        ref={optionsSheetRef}
        enablePanDownToClose={true}
        snapPoints={optionsSheetSnapPoints}
        handleIndicatorStyle={styles.sheetHandle}
        backgroundStyle={styles.sheetBackgroundContainer}
      >
        <OptionSheet />
      </BottomSheet>
      <BottomSheet
        index={-1}
        ref={actionsSheetRef}
        enablePanDownToClose={true}
        snapPoints={actionsSheetSnapPoints}
        handleIndicatorStyle={styles.sheetHandle}
        backgroundStyle={styles.sheetBackgroundContainer}
      >
        <ActionSheet />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  topBarContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sheetBackgroundContainer: {
    backgroundColor: '#181818',
  },
  sheetHandle: {
    backgroundColor: 'white',
  },
});

function useSetupPlayer() {
  const [playerReady, setPlayerReady] = useState<boolean>(false);

  useEffect(() => {
    let unmounted = false;
    (async () => {
      await SetupService();
      if (unmounted) return;
      setPlayerReady(true);
      const queue = await TrackPlayer.getQueue();
      if (unmounted) return;
      if (queue.length <= 0) {
        await QueueInitialTracksService();
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);
  return playerReady;
}
