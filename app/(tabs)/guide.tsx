import { type Href, router } from 'expo-router';
import { BarChart3, ClipboardCheck, ListChecks, PiggyBank, WalletCards } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colours } from '../../src/constants/colours';
import { richLifeDisclaimer } from '../../src/constants/helpText';

const principles = [
  {
    title: 'Conscious Spending Plan',
    explanation:
      'Instead of tracking every tiny purchase with guilt, you create a simple plan for fixed costs, savings, investments, guilt-free spending, and buffer money.',
    helps:
      'The profile setup lets you choose your percentages, and the dashboard turns those percentages into monthly buckets you can actually use.',
    action: 'View dashboard',
    href: '/(tabs)/dashboard' as Href,
    icon: BarChart3,
  },
  {
    title: 'Automate the important stuff',
    explanation:
      'Handle the important money decisions first: bills, savings, investments, and meaningful goals. The app does not move money for you yet, but it helps you check whether those choices happened.',
    helps:
      'Use transactions, goals, and monthly reviews as a manual checklist for the money you want to protect before everyday spending starts.',
    action: 'Track transactions',
    href: '/(tabs)/transactions' as Href,
    icon: ListChecks,
  },
  {
    title: 'Spend extravagantly on what you love',
    explanation:
      'Guilt-free spending is for things you genuinely enjoy. Waste spending is for purchases you regret, did not use, or would rather avoid next time.',
    helps:
      'The dashboard shows your guilt-free spending budget, the transactions screen tracks waste, and the monthly review helps you spot repeat patterns.',
    action: 'Review month',
    href: '/(tabs)/review' as Href,
    icon: ClipboardCheck,
  },
  {
    title: 'Big wins matter more than tiny guilt',
    explanation:
      'The point is not to shame every coffee. Focus on major categories and repeatable habits: savings rate, investment consistency, fixed costs, big purchases, and recurring waste.',
    helps:
      'Money score and Can I Afford This? keep attention on the health of the whole system instead of one small purchase.',
    action: 'Check a purchase',
    href: '/(tabs)/afford' as Href,
    icon: WalletCards,
  },
  {
    title: 'Define your Rich Life',
    explanation:
      'Money should connect to real goals: travelling, buying a laptop, moving abroad, emergency funds, education, family support, or freedom.',
    helps:
      'Goals give those plans a name, a target amount, and a simple way to track progress over time.',
    action: 'View goals',
    href: '/(tabs)/goals' as Href,
    icon: PiggyBank,
  },
  {
    title: 'Buy decisions should fit the system',
    explanation:
      'Can I Afford This? checks whether a purchase fits your current plan instead of relying on emotion, pressure, or guesswork.',
    helps:
      'The purchase checker compares price against guilt-free spending, buffer, savings progress, and investment progress before showing a green, yellow, or red decision.',
    action: 'Try afford check',
    href: '/(tabs)/afford' as Href,
    icon: WalletCards,
  },
] as const;

export default function GuideScreen() {
  return (
    <Screen>
      <SectionHeader
        title="Rich Life Guide"
        subtitle="Inspired by principles commonly associated with Ramit Sethi's conscious spending approach."
      />

      <Card style={styles.disclaimerCard}>
        <Text style={styles.disclaimer}>{richLifeDisclaimer}</Text>
      </Card>

      {principles.map((principle) => (
        <PrincipleCard key={principle.title} {...principle} />
      ))}
    </Screen>
  );
}

function PrincipleCard({
  title,
  explanation,
  helps,
  action,
  href,
  icon: Icon,
}: {
  title: string;
  explanation: string;
  helps: string;
  action: string;
  href: Href;
  icon: (props: { color?: string; size?: number }) => ReactNode;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Icon color={colours.primaryDark} size={22} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <Text style={styles.text}>{explanation}</Text>

      <View style={styles.helpsBox}>
        <Text style={styles.helpsTitle}>How Guilt-Free helps</Text>
        <Text style={styles.helpsText}>{helps}</Text>
      </View>

      <Button title={action} variant="secondary" onPress={() => router.push(href)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  disclaimerCard: {
    backgroundColor: colours.surfaceAlt,
  },
  disclaimer: {
    color: colours.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  card: {
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.surfaceAlt,
  },
  title: {
    flex: 1,
    color: colours.text,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
  },
  text: {
    color: colours.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  helpsBox: {
    borderRadius: 8,
    backgroundColor: colours.input,
    borderWidth: 1,
    borderColor: colours.border,
    padding: 12,
    gap: 6,
  },
  helpsTitle: {
    color: colours.text,
    fontSize: 13,
    fontWeight: '900',
  },
  helpsText: {
    color: colours.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
