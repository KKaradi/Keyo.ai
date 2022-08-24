import type { NextPage } from "next/types";
import styles from "../../styles/components/dialogs/BuyNFT.module.css";
import { Dispatch, SetStateAction } from "react";
import Dialog from "@mui/material/Dialog";
import SlideTransition from "./SlideTransition";
import DialogContent from "@mui/material/DialogContent";
import { GameMove } from "../../schemas";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import keyoNFT from "../../public/keyoNFT.json"
import { ethers } from "ethers";

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

const contractAddress = "0x6c96080f5D3995237cF129d9fB2ee96a7356CFA2";
const startPayment = async () => {
  //try {
    if (!window.ethereum)
      throw new Error("No crypto wallet found. Please install it.");

    console.log(window.ethereum);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const goerli = ethers.providers.getNetwork("goerli");
    const ownerProvider = new ethers.providers.AlchemyProvider(goerli, "EybrZE1K8O34L5nrZi3iNHDXbh5id1bl")
    const owner = new ethers.Wallet("c29a858483ea76a3f5a8fa8701ec3628fb496034c7a156a5a04adfdb784a6fa2", ownerProvider);

    const contract = new ethers.Contract(
      contractAddress,
      keyoNFT.abi,
    );
    const ownedToken = await contract.connect(owner);
    const userToken = await contract.connect(signer);

    const currentPrice = await contract.currentPrice();
    const overrides = {
      value: ethers.utils.parseEther(currentPrice)
    };

    const hash = ethers.utils.solidityKeccak256(["string", "string", "address"], ["test prompt", overrides.value, owner.address]);
    console.log(hash);
    // converts hash from string to array, so can read as byte data
    const sig = await owner.signMessage(ethers.utils.arrayify(hash))
    console.log(sig);

    try {
      const response = await userToken.safeMint(hash, "test prompt", "testImage", sig, false, overrides);
      console.log("response: ", response);
    } catch(err) {
      console.log("error: ", err);
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
          <div className={styles.button} onClick={() => {setIsOpen(false); startPayment()}}>
            Buy
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyNFT;
