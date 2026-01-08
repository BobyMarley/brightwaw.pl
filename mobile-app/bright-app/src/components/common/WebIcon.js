import React from 'react';
import { Text } from 'react-native';

const iconMap = {
  'home': '🏠',
  'add-circle': '➕',
  'time': '🕐',
  'person': '👤',
  'calendar': '📅',
  'location-outline': '📍',
  'chevron-forward': '▶',
  'checkmark-circle': '✅',
  'remove': '➖',
  'add': '➕',
  'grid-outline': '⬜',
  'sunny-outline': '☀️',
  'file-tray-full-outline': '📁',
  'restaurant-outline': '🍽️',
  'cloud-upload-outline': '☁️',
  'hardware-chip-outline': '💾',
  'snow-outline': '❄️',
  'water-outline': '💧',
  'paw-outline': '🐾',
  'shirt-outline': '👕',
  'bed-outline': '🛏️',
  'albums-outline': '📚',
  'browsers-outline': '📱',
  'easel-outline': '🎨',
  'cafe-outline': '☕',
  'document-text-outline': '📄',
  'list-outline': '📋',
  'calendar-outline': '📅',
  'time-outline': '⏰',
  'checkmark-circle-outline': '✅'
};

const WebIcon = ({ name, size = 24, color = '#000', style }) => {
  const emoji = iconMap[name] || '❓';
  
  return (
    <Text style={[{ fontSize: size, color, textAlign: 'center' }, style]}>
      {emoji}
    </Text>
  );
};

export default WebIcon;