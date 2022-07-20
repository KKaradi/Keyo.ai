import type { NextPage } from "next/types";
import { ReturnCharacter } from "../../pages/api/post/multiwordle";
import styles from "../../styles/components/multiwordle/Carousel.module.css";
import Square from "./Square";

type CarouselProps = {
  slides: ReturnCharacter[][][];
};

const Carousel: NextPage<CarouselProps> = ({ slides }) => {
  return (
    <div className={styles.slider}>
      <div className={styles.slides}>
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            id={`slide-${slideIndex + 1}`}
            className={styles.slide}
          >
            {slide.map((word, wordIndex) => (
              <div key={wordIndex} className={styles.word}>
                {word.map(({ character, status }, charIndex) => (
                  <Square
                    key={charIndex}
                    character={character}
                    color={status}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
