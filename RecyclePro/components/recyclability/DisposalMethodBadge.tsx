import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { DisposalMethod } from '@/data/types';
import {
  getDisposalMethodDescription,
  getDisposalMethodIcon,
} from '@/services/recyclabilityService';

interface DisposalMethodBadgeProps {
  method: DisposalMethod;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export function DisposalMethodBadge({
  method,
  size = 'medium',
  showIcon = true,
}: DisposalMethodBadgeProps) {
  const icon = getDisposalMethodIcon(method);
  const description = getDisposalMethodDescription(method);
  const colors = getDisposalMethodColors(method);

  const badgeStyle = [
    styles.badge,
    { backgroundColor: colors.background },
    size === 'small' && styles.badgeSmall,
    size === 'large' && styles.badgeLarge,
  ];

  const textStyle = [
    styles.text,
    { color: colors.text },
    size === 'small' && styles.textSmall,
    size === 'large' && styles.textLarge,
  ];

  return (
    <View style={badgeStyle}>
      {showIcon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
      <ThemedText style={textStyle}>{description}</ThemedText>
    </View>
  );
}

/**
 * Get color scheme for each disposal method
 */
function getDisposalMethodColors(method: DisposalMethod): {
  background: string;
  text: string;
} {
  const colorMap: Record<DisposalMethod, { background: string; text: string }> = {
    curbside_recycling: { background: '#E8F5E9', text: '#2E7D32' },
    curbside_trash: { background: '#ECEFF1', text: '#455A64' },
    curbside_compost: { background: '#F1F8E9', text: '#558B2F' },
    special_recycling_center: { background: '#E3F2FD', text: '#1565C0' },
    hazardous_waste: { background: '#FFF3E0', text: '#E65100' },
    e_waste: { background: '#E1F5FE', text: '#0277BD' },
    donation: { background: '#FCE4EC', text: '#C2185B' },
    return_to_store: { background: '#F3E5F5', text: '#7B1FA2' },
    mail_back: { background: '#E8EAF6', text: '#3949AB' },
  };

  return colorMap[method] || { background: '#F5F5F5', text: '#616161' };
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  icon: {
    marginRight: 6,
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 12,
    fontWeight: '500',
  },
  textLarge: {
    fontSize: 16,
    fontWeight: '600',
  },
});
