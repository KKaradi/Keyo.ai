import styles from "../styles/components/misc/Square.module.css";

export const animationModes = {
  none: styles.container,
  error: styles.containerErrorAnimation,
  input: styles.containerInputAnimation,
} as const;

export type AnimationKeys = keyof typeof animationModes;
