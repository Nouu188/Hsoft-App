import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, Platform } from 'react-native';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { ProfileStackParamList, Ringtone } from '@/navigation/types';
import RingToneHeader from '@/components/specific/profile/setting/ringtone/RingToneHeader';
import RingtoneSelectionContent from '@/components/specific/profile/setting/ringtone/RingtoneSelectionContent';
import AddButton from '@/components/specific/profile/setting/ringtone/FloatingButton';

const RingtoneSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, 'Profile'>>();
  const [selectedRingtoneId, setSelectedRingtoneId] = useState<string | null>(null);
  const [playingRingtoneId, setPlayingRingtoneId] = useState<string | null>(null);
  const soundRef = useRef<Sound | null>(null);
  const [myRingtones, setMyRingtones] = useState<Ringtone[]>([]);

  const systemRingtones: Ringtone[] = [
    { id: 'bonglai', name: 'Bông lai', duration: '00:16', isCustom: false, uri: 'file:///system/bonglai.mp3' },
    { id: 'blue', name: 'Blue', duration: '00:11', isCustom: false, uri: 'file:///system/blue.mp3' },
  ];
  const defaultRingtone: Ringtone = { id: 'default', name: 'Nhạc chuông mặc định', duration: '', isCustom: false, uri: 'default_ring_tone.wav' };

  useEffect(() => {
    const loadRingtones = async () => {
      try {
        const stored = await AsyncStorage.getItem('myRingtones');
        if (stored) setMyRingtones(JSON.parse(stored));
        const storedSelected = await AsyncStorage.getItem('selectedRingtoneId');
        if (storedSelected) setSelectedRingtoneId(storedSelected);
      } catch (err) { console.log('Load ringtones error', err); }
    };
    loadRingtones();
  }, []);

  const saveRingtones = async (ringtones: Ringtone[]) => {
    try { await AsyncStorage.setItem('myRingtones', JSON.stringify(ringtones)); } 
    catch (err) { console.log('Save ringtones error', err); }
  };
  const saveSelectedRingtone = async (ringtoneId: string | null) => {
    try {
      if (ringtoneId) await AsyncStorage.setItem('selectedRingtoneId', ringtoneId);
      else await AsyncStorage.removeItem('selectedRingtoneId');
    } catch (err) { console.log('Save selected ringtone error', err); }
  };

  const handleApplyRingtone = (r: Ringtone) => { setSelectedRingtoneId(r.id); saveSelectedRingtone(r.id); };
  const handleDisableRingtone = () => { setSelectedRingtoneId(null); saveSelectedRingtone(null); };
  const handleAddRingTonePress = () => {
    navigation.navigate('AddRingtone', { onSelect: (newR: Ringtone) => {
      const updated = [...myRingtones, newR];
      setMyRingtones(updated); saveRingtones(updated);
    }});
  };

  const handlePlayPause = (ringtone: Ringtone) => {
    if (playingRingtoneId === ringtone.id) { soundRef.current?.pause(); setPlayingRingtoneId(null); return; }
    if (soundRef.current) { soundRef.current.stop(() => soundRef.current?.release()); soundRef.current = null; }

    let sound: Sound;
    if (ringtone.id === 'default') {
      let path = Platform.OS === 'android' ? 'default_ring_tone' : 'default-ring-tone.wav';
      sound = new Sound(path, Sound.MAIN_BUNDLE, (error) => {
        if (error) { console.log('Failed to load default sound', error); return; }
        sound.play(() => { sound.release(); setPlayingRingtoneId(null); });
        setPlayingRingtoneId(ringtone.id);
      });
    } else {
      sound = new Sound(ringtone.uri, '', (error) => {
        if (error) { console.log('Failed to load sound', error); return; }
        sound.play(() => { sound.release(); setPlayingRingtoneId(null); });
        setPlayingRingtoneId(ringtone.id);
      });
    }
    soundRef.current = sound;
  };

  const handleDeleteRingtone = (ringtone: Ringtone) => {
    const updated = myRingtones.filter((r) => r.id !== ringtone.id);
    setMyRingtones(updated);
    saveRingtones(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <RingToneHeader navigation={navigation} />
      <RingtoneSelectionContent
        defaultRingtone={defaultRingtone}
        myRingtones={myRingtones}
        systemRingtones={systemRingtones}
        selectedRingtoneId={selectedRingtoneId}
        playingRingtoneId={playingRingtoneId}
        onApply={handleApplyRingtone}
        onDisable={handleDisableRingtone}
        onPlay={handlePlayPause}
        onDelete={handleDeleteRingtone}
      />
      <AddButton onPress={handleAddRingTonePress} />
    </SafeAreaView>
  );
};

export default RingtoneSelectionScreen;