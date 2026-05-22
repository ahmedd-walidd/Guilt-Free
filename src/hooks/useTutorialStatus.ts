import { useEffect, useState } from 'react';

import { getTutorialCompleted } from '../services/tutorialStorage';

export function useTutorialStatus() {
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    getTutorialCompleted()
      .then((completed) => {
        if (isMounted) {
          setHasCompletedTutorial(completed);
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasCompletedTutorial(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return hasCompletedTutorial;
}
