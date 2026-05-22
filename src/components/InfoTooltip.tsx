import { Info, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colours } from '../constants/colours';

type InfoTooltipProps = {
  title: string;
  body: string;
};

export function InfoTooltip({ title, body }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`More information about ${title}`}
        onPress={() => setVisible(true)}
        style={styles.iconButton}
      >
        <Info color={colours.primaryDark} size={17} />
      </Pressable>

      <Modal transparent animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close help"
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <X color={colours.text} size={20} />
              </Pressable>
            </View>
            <Text style={styles.body}>{body}</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.surfaceAlt,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(23, 32, 28, 0.36)',
  },
  sheet: {
    margin: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colours.border,
    backgroundColor: colours.surface,
    padding: 18,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    color: colours.text,
    fontSize: 20,
    fontWeight: '900',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.input,
  },
  body: {
    color: colours.muted,
    fontSize: 16,
    lineHeight: 24,
  },
});
