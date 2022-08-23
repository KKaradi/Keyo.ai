import type { NextPage } from "next/types";
import styles from "../../styles/components/dialogs/BuyNFT.module.css";
import { Dispatch, SetStateAction } from "react";
import Dialog from "@mui/material/Dialog";
import SlideTransition from "./SlideTransition";
import DialogContent from "@mui/material/DialogContent";
import { GameMove } from "../../schemas";
import Image from "next/image";

type BuyNFTProps = {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  gameState: GameMove;
};

const positionToSufix = {
  1: "st",
  2: "nd",
  3: "rd",
} as { [key: number]: string };

function parsePrompt(
  inputs: {
    completed: boolean;
    characters: {
      status: "green" | "yellow" | "gray" | "empty";
      character: string;
    }[];
  }[]
) {
  let prompt = "";
  inputs.forEach((word) => {
    word.characters.forEach((character) => {
      prompt += character.character;
    });
    prompt += " ";
  });
  prompt = prompt.slice(0, -1);
  return prompt;
}

const BuyNFT: NextPage<BuyNFTProps> = ({ openState, gameState }) => {
  console.log(openState.length);
  const prompt = parsePrompt(gameState["inputs"]);

  console.log(prompt, "prompt");
  const [isOpen, setIsOpen] = openState;
  return (
    <Dialog
      open={isOpen}
      TransitionComponent={SlideTransition}
      keepMounted
      onClose={() => setIsOpen(false)}
      PaperProps={{
        style: {
          //   backgroundColor: "#bfbfbf",
          boxShadow: "none",
          width: "100%",
          textAlign: "center",
          borderRadius: "10px",
        },
      }}
    >
      <DialogContent sx={{ textAlign: "center" }}>
        <h2>Buy NFT</h2>
        {/* <hr className={styles.rule} />  */}
        <div>
          <div className={styles.image}>
            <Image
              src={gameState.imagePath}
              width={14}
              height={10}
              layout="responsive"
              objectFit="cover"
              alt="Hint Image"
              priority
            />
          </div>
          <h3 className={styles.caption}>&quot;{prompt}&quot;</h3>

          <p>Guesses: {gameState.attempt}</p>
          <p>
            Global Rank:
            {gameState.globalPosition
              ? ` ${gameState.globalPosition}${
                  positionToSufix[gameState.globalPosition] ?? "th"
                }`
              : `We couldn't find your global position`}
          </p>
          <div className={styles.button} onClick={() => setIsOpen(false)}>
            Buy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyNFT;
