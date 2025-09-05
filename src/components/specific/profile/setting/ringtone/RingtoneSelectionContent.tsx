import React from 'react';
import { ScrollView } from 'react-native';
import DefaultOption from '@/components/specific/profile/setting/ringtone/DefaultOption';
import RingtoneCategory from '@/components/specific/profile/setting/ringtone/RingtoneCategory';
import type { Ringtone } from '@/navigation/types';

type Props = {
  defaultRingtone: Ringtone;
  myRingtones: Ringtone[];
  systemRingtones: Ringtone[];
  selectedRingtoneId: string | null;
  playingRingtoneId: string | null;
  onApply: (r: Ringtone) => void;
  onDisable: () => void;
  onPlay: (r: Ringtone) => void;
  onDelete: (r: Ringtone) => void;
};

const RingtoneSelectionContent: React.FC<Props> = ({ defaultRingtone, myRingtones, systemRingtones, selectedRingtoneId, playingRingtoneId, onApply, onDisable, onPlay, onDelete }) => (
  <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
    <DefaultOption title="Không đặt làm nhạc chuông" onApply={onDisable} />
    <DefaultOption title={defaultRingtone.name} ringtone={defaultRingtone} onApply={(r) => r && onApply(r)} onPlay={onPlay} />

    <RingtoneCategory
      title="Nhạc chuông của tôi"
      ringtones={myRingtones}
      onApply={onApply}
      selectedRingtoneId={selectedRingtoneId}
      onPlay={onPlay}
      playingRingtoneId={playingRingtoneId}
      onDelete={onDelete} 
    />

    <RingtoneCategory
      title="Nhạc chuông hệ thống"
      ringtones={systemRingtones}
      onApply={onApply}
      selectedRingtoneId={selectedRingtoneId}
      onPlay={onPlay}
      playingRingtoneId={playingRingtoneId}
    />
  </ScrollView>
);

export default RingtoneSelectionContent;