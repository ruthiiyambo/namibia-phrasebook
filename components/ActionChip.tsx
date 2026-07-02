import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';

type Props = {
  active?: boolean;
  label: string;
  onPress: () => void;
};

export function ActionChip({ active = false, label, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    color: Colors.textMid,
    fontSize: 13,
    fontWeight: '700',
  },
  labelActive: {
    color: '#fff',
  },
});
