import { useEffect, useState } from 'react';
import { useScroll, useTransform } from 'framer-motion';

interface SectionProgress {
  currentSection: number;
  progress: number;
}

export const useSectionProgress = (numberOfSections: number): SectionProgress => {
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      const sectionHeight = 1 / numberOfSections;
      const currentSectionIndex = Math.floor(latest / sectionHeight);
      const sectionProgress = (latest % sectionHeight) / sectionHeight;

      setCurrentSection(currentSectionIndex);
      setProgress(sectionProgress);
    });
  }, [numberOfSections, scrollYProgress]);

  return { currentSection, progress };
};