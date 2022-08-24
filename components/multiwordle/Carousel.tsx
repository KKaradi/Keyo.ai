import type { NextPage } from "next/types";
import {
  createRef,
  forwardRef,
  ForwardRefRenderFunction,
  useState,
} from "react";
import styles from "../../styles/components/multiwordle/Carousel.module.css";
import Square from "../misc/Square";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Character } from "../../schemas";

type SlideProps = {
  slide: Character[][];
  index: number;
  displayBest: boolean;
};

const Slide: ForwardRefRenderFunction<HTMLDivElement, SlideProps> = (
  { slide, index, displayBest },
  ref
) => {
  let completed: Character[] | null = null;

  const words = slide.slice(0, -1).filter((word) => {
    const filtered = word.filter(({ status }) => status === "green");
    if (filtered.length === word.length) {
      completed = word;
      return false;
    }
    return true;
  });

  if (completed) words.unshift(completed);

  return (
    <div id={`slide-${index + 1}`} className={styles.slide} ref={ref}>
      {words.reverse().map((word, wordIndex) => (
        <div key={wordIndex} className={styles.word}>
          {word.map(({ character, status }, charIndex) => {
            const last = words.length - 1;
            const empty = wordIndex == last && displayBest && !completed;
            return (
              <div className={styles.cell} key={charIndex}>
                <Square
                  character={empty ? "" : character}
                  color={status}
                  animationMode="none"
                  setAnimationMode={undefined}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const ForwardedRefSlide = forwardRef(Slide);

type CarouselProps = {
  slides: Character[][][];
  slideState: [number, (value: number) => void];
  displayBest: boolean;
  isMobile: boolean;
};

const Carousel: NextPage<CarouselProps> = ({
  slides,
  slideState,
  displayBest,
  isMobile,
}) => {
  const [slide, setSlide] = slideState;

  const ref = createRef<HTMLDivElement>();
  const refs = slides.map(() => createRef<HTMLDivElement>());

  const onScroll = () => {
    if (!ref.current) return;
    const { x } = ref.current.getBoundingClientRect();

    let slideIndex: number | undefined;

    refs.forEach((slideRef, index) => {
      if (!slideRef.current) return false;
      const { x: slideX } = slideRef.current.getBoundingClientRect();
      if (x == slideX) slideIndex = index;
    });

    if (slideIndex !== undefined) setSlide(slideIndex);
  };

  const left = slide === 0 ? 0 : slide - 1;
  const right = slide === slides.length - 1 ? slides.length - 1 : slide + 1;
  const fontSize = isMobile ? "small" : "large";

  return (
    <div className={styles.carousel}>
      <a href={`#slide-${left + 1}`} className={styles.arrow}>
        <KeyboardArrowLeftIcon fontSize={fontSize} />
      </a>

      <div className={styles.slider} ref={ref}>
        <div className={styles.slides} onScroll={onScroll}>
          {slides.map((slide, slideIndex) => (
            <ForwardedRefSlide
              key={slideIndex}
              index={slideIndex}
              slide={slide}
              displayBest={displayBest}
              ref={refs[slideIndex]}
            />
          ))}
        </div>
      </div>
      <a href={`#slide-${right + 1}`} className={styles.arrow}>
        <KeyboardArrowRightIcon fontSize={fontSize} />
      </a>
    </div>
  );
};

export default Carousel;
