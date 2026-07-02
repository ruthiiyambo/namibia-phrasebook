import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { AppInfo } from '@/lib/app-info';

const POLICY_SECTIONS = [
  {
    title: 'What This Build Does',
    body:
      'Namibia Phrasebook is a guest-first phrasebook for practical travel communication. The launch build lets people browse bundled phrases without creating an account.',
  },
  {
    title: 'Data In This Version',
    body:
      'The current app experience is workbook-backed and does not require sign in, account creation, or payment details to browse phrases.',
  },
  {
    title: 'Permissions And Tracking',
    body:
      'This guest-only v1 does not ask for camera, microphone, contacts, location, or photo library access, and it does not include third-party ad tracking.',
  },
  {
    title: 'Support',
    body: `For launch questions, phrase corrections, or install issues, contact ${AppInfo.supportEmail}.`,
  },
];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: true, title: 'Privacy & Data' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy summary for the current launch build</Text>
        <Text style={styles.subtitle}>
          This policy reflects the guest-only phrasebook version that ships with bundled workbook content.
        </Text>

        <View style={styles.highlightCard}>
          {AppInfo.privacyHighlights.map((item) => (
            <Text key={item} style={styles.highlightLine}>
              • {item}
            </Text>
          ))}
        </View>

        {POLICY_SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          If the app later adds accounts, purchases, analytics, or other data collection, this policy should be updated before the next submission.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 33,
  },
  subtitle: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  highlightCard: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    marginTop: 18,
    padding: 18,
  },
  highlightLine: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    padding: 18,
  },
  cardTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardBody: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
  },
});
