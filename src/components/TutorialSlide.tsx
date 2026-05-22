import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colours } from '../constants/colours';

type MiniCard = {
  label: string;
  value?: string;
  colour?: string;
};

type TutorialSlideProps = {
  eyebrow?: string;
  title: string;
  text: string;
  icon: LucideIcon;
  cards?: MiniCard[];
  disclaimer?: string;
  width: number;
};

export function TutorialSlide({ eyebrow, title, text, icon: Icon, cards = [], disclaimer, width }: TutorialSlideProps) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.art}>
        <View style={styles.iconRing}>
          <Icon color={colours.primaryDark} size={46} strokeWidth={2.2} />
        </View>
        {cards.length > 0 ? (
          <View style={styles.cardGrid}>
            {cards.map((card) => (
              <View key={card.label} style={[styles.miniCard, card.colour ? { borderColor: card.colour } : null]}>
                <View style={[styles.dot, card.colour ? { backgroundColor: card.colour } : null]} />
                <Text style={styles.cardLabel} numberOfLines={2}>
                  {card.label}
                </Text>
                {card.value ? <Text style={styles.cardValue}>{card.value}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
        {disclaimer ? <Text style={styles.disclaimer}>{disclaimer}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: 'center',
    gap: 28,
  },
  art: {
    minHeight: 280,
    borderRadius: 28,
    backgroundColor: colours.surfaceAlt,
    borderWidth: 1,
    borderColor: colours.border,
    padding: 20,
    justifyContent: 'center',
    gap: 18,
  },
  iconRing: {
    alignSelf: 'center',
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.surface,
    borderWidth: 1,
    borderColor: colours.border,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  miniCard: {
    width: '47%',
    minHeight: 74,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colours.border,
    backgroundColor: colours.surface,
    padding: 10,
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colours.primary,
  },
  cardLabel: {
    color: colours.text,
    fontSize: 13,
    fontWeight: '800',
  },
  cardValue: {
    color: colours.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  copy: {
    gap: 10,
  },
  eyebrow: {
    color: colours.primaryDark,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colours.text,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
  },
  text: {
    color: colours.muted,
    fontSize: 17,
    lineHeight: 25,
  },
  disclaimer: {
    color: colours.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
});
