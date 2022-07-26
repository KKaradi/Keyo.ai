import type { NextPage } from "next/types";
import { createRef, forwardRef, ForwardRefRenderFunction } from "react";
import { ReturnCharacter } from "../../pages/api/post/multiwordle";
import styles from "../../styles/components/multiwordle/Carousel.module.css";
import Square from "../misc/Square";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

type SlideProps = {
  slide: ReturnCharacter[][];
  index: number;
  displayBest: boolean;
};

const Slide: ForwardRefRenderFunction<HTMLDivElement, SlideProps> = (
  { slide, index, displayBest },
  ref
) => {
  let completed: ReturnCharacter[] | null = null;

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
      {words.map((word, wordIndex) => (
        <div key={wordIndex} className={styles.word}>
          {word.map(({ character, status }, charIndex) => {
            const isEmpty = wordIndex === 0 && displayBest && !completed;
            return (
              <div className={styles.cell} key={charIndex}>
                <Square character={isEmpty ? "" : character} color={status} />
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
  slides: ReturnCharacter[][][];
  slideState: [number, (value: number) => void];
  displayBest: boolean;
};

const Carousel: NextPage<CarouselProps> = ({
  slides,
  slideState,
  displayBest,
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

  return (
    <div className={styles.carousel}>
      <a href={`#slide-${left + 1}`}>
        <KeyboardArrowLeftIcon fontSize="large" />
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
      <a href={`#slide-${right + 1}`}>
        <KeyboardArrowRightIcon fontSize="large" />
      </a>
    </div>
  );
};

export default Carousel;
