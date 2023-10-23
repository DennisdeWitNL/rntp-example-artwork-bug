import React, { useEffect } from 'react';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { Spacer } from './Spacer';
import { Button } from './Button';
import TrackPlayer from 'react-native-track-player';

const onUpdateNotificationMetadata = async () => {
  const randomTitle = Math.random().toString(36).substring(7);
  await TrackPlayer.updateNowPlayingMetadata({
    title: `Random: ${randomTitle}`,
    artwork: `https://random.imagecdn.app/800/800?dummy=${Date.now()}`,
  });
};

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

  console.log("Updating metadata");
  const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
  let songDataFunction = await fetchNowPlaying();
  if (currentTrackIndex !== undefined) {
    const randomTitle = Math.random().toString(36).substring(7);
    await TrackPlayer.updateMetadataForTrack(currentTrackIndex, {
      title: songDataFunction.song_title,
      artist: songDataFunction.song_artist,
      artwork: 'https://live-streams.nl/40rocknowplaying/R40RockLogo.jpg'
      // duration: Math.floor(Math.random()),
    });
  }
  
};


const retrieveEveryTenSeconds = async () => {
  setInterval(() => {
  onUpdateCurrentTrackMetadata();
  }, 10000);
}

const onReset = async () => {
  await TrackPlayer.reset();
};


export const ActionSheet: React.FC = () => {
  return (
    <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
      <Spacer />
      <Button
        title={'Update Notification Metadata Randomly'}
        onPress={onUpdateNotificationMetadata}
        type={'primary'}
      />
      <Button
        title={'Update Current Track Metadata Every 10 seconds'}
        onPress={retrieveEveryTenSeconds}
        type={'primary'}
      />
      <Button title={'Reset'} onPress={onReset} type={'primary'} />
    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    marginTop: '4%',
    marginHorizontal: 16,
  },
  optionRowLabel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
});
