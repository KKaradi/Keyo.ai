import type { NextPage, NextPageContext } from "next";
import { post, get } from "../helpers";
import { DefinedGameMove } from "./api/post/multiwordle";
const MultiWordlePage: NextPage<{initalGameState:DefinedGameMove}> = ({initalGameState: json}) => {
  console.log(json)
  return <div style={{'display':'flex','flexDirection':'row',}}>
    
  </div>;
};

//Tokyo harbor
export const getServerSideProps = async (context: NextPageContext) => {

  const res = await post("http://localhost:3000/api/post/multiwordle", {gameStatus:"new"});
  const json = await res.json();
  return { props: {json} };
};
export default MultiWordlePage;
