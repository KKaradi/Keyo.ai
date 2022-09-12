import type { NextPage } from "next/types";
import styles from "../../styles/components/dialogs/BuyNFT.module.css";
import { Dispatch, SetStateAction } from "react";
import Dialog from "@mui/material/Dialog";
import SlideTransition from "./SlideTransition";
import DialogContent from "@mui/material/DialogContent";
import { GameMove } from "../../schemas";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import keyoNFT from "../../public/keyoNFT.json";
import { ethers } from "ethers";
import ErrorPage from "../misc/ErrorPage";

type BuyNFTProps = {
  openState: [boolean, Dispatch<SetStateAction<boolean>>];
  winDialogOpenState: [boolean, Dispatch<SetStateAction<boolean>>];
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

// change contract address to eth
const contractAddress = "0x12A3B8a5612D8b63cF688936b23E50fe3A27BD3d";
const startPayment = async (
  prompt: string,
  imageCID: string,
  gameId: number
) => {
  //try {
  if (!window.ethereum)
    throw new Error("No crypto wallet found. Please install it.");
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);

  const signer = provider.getSigner();

  const ownerProvider = new ethers.providers.AlchemyProvider(
    "homestead",
    "zGZRwFjRnAck7E9pClkBFgjZcaNVYUot"
  );

  const owner = new ethers.Wallet(
    "e5b9abadff0a8f435abe8f802385aac594fd0a3d176a0b88029cde587a347f5d",
    ownerProvider
  );

  // contract instance
  const contract = new ethers.Contract(contractAddress, keyoNFT.abi);

  // connects owner to contract
  const ownedToken = await contract.connect(owner);
  // connects player to contract
  const userToken = await contract.connect(signer);

  const contractGameId = await userToken.currentGameId();
  // true if gameId is +1 contract gameid, so new game in play
  const newGame = gameId - 1 == contractGameId.toNumber();

  // if new game or gameid is the same then continue
  if (newGame || gameId == contractGameId) {
    // if new game, then currentprice will equal 0, if not then currentprice
    const currentPrice = newGame
      ? ethers.BigNumber.from(0)
      : await ownedToken.currentPrice();
    const overrides = {
      value: currentPrice.toString(),
    };

    const hash = ethers.utils.solidityKeccak256(
      ["string", "string", "address"],
      [
        prompt,
        ethers.utils.formatEther(currentPrice),
        await signer.getAddress(),
      ]
    );

    // converts hash from string to array, so can read as byte data
    const sig = await owner.signMessage(ethers.utils.arrayify(hash));

    try {
      const response = await userToken.safeMint(
        hash,
        prompt,
        imageCID,
        sig,
        gameId,
        overrides
      );
      if (response) return true;
    } catch (err) { return false; }
  }
  else {
    // something is wrong with the game indexing, needs manual support
    return false;
  }
};

const BuyNFT: NextPage<BuyNFTProps> = ({
  openState,
  gameState,
  winDialogOpenState,
}) => {
  const prompt = parsePrompt(gameState["inputs"]);

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
        <div className={styles.titleDiv}>
          <div
            onClick={() => {
              openState[1](false);
              winDialogOpenState[1](true);
            }}
            className={styles.backButton}
          >
            <ArrowBackIcon />
          </div>
          <h2>Buy NFT</h2>
          <div />
        </div>
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
              : ` We couldn't find your global position`}
          </p>
          <div
            className={styles.button}
            onClick={async () => {
              setIsOpen(false);
              if (prompt !== undefined && gameState.imageCID !== undefined) {
                let result = await startPayment(prompt, gameState.imageCID, gameState.gameId);
                if (result)
                {
                  window.location.reload();
                }
                else
                {
                  console.log("There seems to be a server side error. This will be resolved shortly")
                }
              }
            }}
          >
            Buy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyNFT;
