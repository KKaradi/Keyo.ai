/* eslint-disable react/display-name */
import type { NextPage } from "next/types";
import { createRef, forwardRef } from "react";
import { ReturnCharacter } from "../../pages/api/post/multiwordle";
import styles from "../../styles/components/multiwordle/Carousel.module.css";
import Square from "./Square";

type SlideProps = {
  slide: ReturnCharacter[][];
  index: number;
};

const Slide = forwardRef<HTMLDivElement, SlideProps>(
  ({ slide, index }, ref) => (
    <div id={`slide-${index + 1}`} className={styles.slide} ref={ref}>
      {slide.map((word, wordIndex) => (
        <div key={wordIndex} className={styles.word}>
          {word.map(({ character, status }, charIndex) => (
            <div className={styles.cell} key={charIndex}>
              <Square character={character} color={status} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
);

type CarouselProps = {
  slides: ReturnCharacter[][][];
  setSlide: (value: number) => void;
};

const Carousel: NextPage<CarouselProps> = ({ slides, setSlide }) => {
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

  return (
    <div className={styles.slider} ref={ref}>
      <div className={styles.slides} onScroll={onScroll}>
        {slides.map((slide, slideIndex) => (
          <Slide
            key={slideIndex}
            index={slideIndex}
            slide={slide}
            ref={refs[slideIndex]}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
