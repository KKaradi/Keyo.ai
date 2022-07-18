import type { NextPage, NextPageContext } from "next";
import { post, get } from "../helpers";
import { DefinedGameMove } from "./api/post/multiwordle";
const MultiWordlePage: NextPage<{json:any}> = ({json}) => {
  console.log(json)
  return <div></div>;
};

//Tokyo harbor
export const getServerSideProps = async (context: NextPageContext) => {
  const gameMove: DefinedGameMove = {
    gameId: 1,
    inputs: [
      {
        completed: false,
        characters: [
          { character: "t" },
          { character: "o" },
          { character: "o" },
          { character: "n" },
          { character: "y" },
        ],
      },
      {
        completed: false,
        characters: [
          { character: "h" },
          { character: "a" },
          { character: "r" },
          { character: "b" },
          { character: "o" },
          { character: "r" },
        ],
      },
    ],
    gameStatus: "started",
  };

  const res = await post("http://localhost:3000/api/post/multiwordle", gameMove);
  console.log(res.status);
  const json = await res.json();
  console.log(json);
  return { props: {json} };
};
export default MultiWordlePage;
