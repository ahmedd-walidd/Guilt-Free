import { router } from 'expo-router';
import {
  BadgeCheck,
  ClipboardList,
  Coffee,
  Gauge,
  Landmark,
  ShieldCheck,
  WalletCards,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { TutorialSlide } from '../src/components/TutorialSlide';
import { colours } from '../src/constants/colours';
import { richLifeDisclaimer } from '../src/constants/helpText';
import { setTutorialCompleted } from '../src/services/tutorialStorage';
import { useAuthStore } from '../src/stores/authStore';

const slides = [
  {
    eyebrow: 'Welcome to Guilt-Free',
    title: 'Spend without guessing',
    text:
      'Guilt-Free helps you divide your income into clear buckets so you know what must be paid, what should be saved, and what you can spend freely.',
    icon: WalletCards,
    cards: [
      { label: 'Bills', value: 'Must be paid', colour: colours.accent },
      { label: 'Goals', value: 'Future you', colour: colours.success },
      { label: 'Fun', value: 'Spend freely', colour: colours.primary },
      { label: 'Buffer', value: 'Breathing room', colour: colours.warning },
    ],
  },
  {
    title: 'Every pound has a job',
    text: 'Your income is split into fixed costs, savings, investments, guilt-free spending, and buffer money.',
    icon: ClipboardList,
    cards: [
      { label: 'Fixed costs', value: 'Bills and needs' },
      { label: 'Savings', value: 'Future goals' },
      { label: 'Investments', value: 'Your own plan' },
      { label: 'Guilt-free', value: 'Fun money' },
      { label: 'Buffer', value: 'Extra space' },
    ],
  },
  {
    title: 'Enjoy money without guilt',
    text:
      'This is the amount you can spend on eating out, coffee, games, clothes, and fun after your important money goals are handled.',
    icon: Coffee,
    cards: [
      { label: 'Coffee', colour: colours.warning },
      { label: 'Games', colour: colours.accent },
      { label: 'Clothes', colour: colours.primary },
      { label: 'Eating out', colour: colours.success },
    ],
  },
  {
    title: 'Check before you buy',
    text:
      'Before a big purchase, Guilt-Free checks your remaining spending money, savings progress, and buffer to tell you whether buying now is safe.',
    icon: BadgeCheck,
    cards: [
      { label: 'Green', value: 'Fits your plan', colour: colours.success },
      { label: 'Yellow', value: 'Think twice', colour: colours.warning },
      { label: 'Red', value: 'Save first', colour: colours.danger },
    ],
  },
  {
    title: 'Track your system, not your shame',
    text:
      'Your score shows whether your money system is healthy this month. It rewards saving, investing, controlled spending, and avoiding waste.',
    icon: Gauge,
    cards: [
      { label: 'Money score', value: 'Monthly health' },
      { label: 'Waste spending', value: 'What to avoid' },
    ],
  },
  {
    title: 'Inspired by conscious spending',
    text:
      'Guilt-Free helps you apply ideas from I Will Teach You to Be Rich: automate the important things, save and invest first, spend freely on what matters, and cut what you do not value.',
    icon: Landmark,
    disclaimer: 'Independent app. Not affiliated with Ramit Sethi or the book.',
    cards: [
      { label: 'Plan first', value: 'Set percentages' },
      { label: 'Review monthly', value: 'Notice patterns' },
    ],
  },
  {
    title: 'No judgement. No stock tips.',
    text:
      'Guilt-Free does not tell you what to invest in. Investment only means money you choose to set aside for your own long-term plan.',
    icon: ShieldCheck,
    disclaimer: richLifeDisclaimer,
    cards: [
      { label: 'You choose goals' },
      { label: 'You choose investments' },
      { label: 'The app tracks your plan' },
    ],
  },
];

export default function TutorialScreen() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<(typeof slides)[number]>>(null);
  const { session, profile } = useAuthStore();
  const isLast = index === slides.length - 1;

  const finish = async () => {
    await setTutorialCompleted(true);

    if (!session) {
      router.replace('/(auth)/sign-in');
      return;
    }

    if (!profile?.has_completed_onboarding) {
      router.replace('/onboarding');
      return;
    }

    router.replace('/(tabs)/dashboard');
  };

  const goTo = (nextIndex: number) => {
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setIndex(nextIndex);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Guilt-Free</Text>
        <Pressable accessibilityRole="button" onPress={() => void finish()} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(event) => {
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => <TutorialSlide {...item} width={width} />}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((slide, slideIndex) => (
            <View key={slide.title} style={[styles.dot, slideIndex === index ? styles.activeDot : null]} />
          ))}
        </View>

        <View style={styles.controls}>
          <Button
            title="Back"
            variant="secondary"
            disabled={index === 0}
            onPress={() => goTo(Math.max(0, index - 1))}
            style={styles.controlButton}
          />
          <Button
            title={isLast ? 'Get Started' : 'Next'}
            onPress={() => (isLast ? void finish() : goTo(Math.min(slides.length - 1, index + 1)))}
            style={styles.controlButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colours.background,
  },
  topBar: {
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: colours.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  skipButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  skipText: {
    color: colours.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    padding: 18,
    gap: 16,
  },
  dots: {
    height: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colours.border,
  },
  activeDot: {
    width: 22,
    backgroundColor: colours.primary,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    flex: 1,
  },
});
