import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_COMPLETED_KEY = 'guilt-free:tutorial-completed';

export async function getTutorialCompleted() {
  const value = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
  return value === 'true';
}

export async function setTutorialCompleted(completed = true) {
  await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, completed ? 'true' : 'false');
}

export const tutorialStorage = {
  getTutorialCompleted,
  setTutorialCompleted,
};
