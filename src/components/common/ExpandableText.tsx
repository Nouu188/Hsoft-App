import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '@/constants/theme';

interface ExpandableTextProps {
  text: string;
  limit?: number;
  fontSize?: number;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, limit = 150, fontSize }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  if (text.length <= limit) {
    return <Text style={{ color: COLORS.textDark, fontSize: fontSize ?? 16 }}>{text}</Text>;
  }

  const displayText = expanded ? text : text.slice(0, limit) + '...';

  return (
    <View>
      <Text style={{ color: COLORS.textDark, fontSize: fontSize ?? 16 }}>{displayText}</Text>
      <TouchableOpacity onPress={toggleExpanded}>
        <Text style={{ color: COLORS.lightBlue, marginTop: 4 }}>
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExpandableText;
