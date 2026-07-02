import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PhrasebookStateProvider } from '@/hooks/usePhrasebookState';

export default function RootLayout() {
  return (
    <PhrasebookStateProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PhrasebookStateProvider>
  );
}
