import type { NextPage } from "next";
import Wordle from '../components/prototypes/A/wordle';
const Home: NextPage = () => {
  return (
    <div>
      <h1>Hello Next.js</h1>
      <Wordle/>
      <input type="text" />
    </div>
  );
};

export default Home;
