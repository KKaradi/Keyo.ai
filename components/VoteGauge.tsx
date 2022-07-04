import { NextPage } from "next/types";
import GaugeChart from "react-gauge-chart";
import styles from "../styles/components/Header.module.css";

type VoteGaugeProps = {
  votes: number;
  percentiles: number[];
};

const VoteGauge: NextPage<VoteGaugeProps> = ({ votes, percentiles }) => {
  let index = percentiles.indexOf(votes);

  if (index == -1) {
    percentiles.push(votes);
    percentiles.sort();
    index = percentiles.indexOf(votes);
  }

  return (
    <div className={styles.chartContainer}>
      <GaugeChart
        id="chart"
        className={styles.chart}
        percent={percentiles.length == 1 ? 1 : index / (percentiles.length - 1)}
        hideText
        colors={["#FF0000", "#FFFF00", "#00FF00"]}
        needleColor="#FFFFFF"
        needleBaseColor="#FFFFFF"
        animate={false}
      />
    </div>
  );
};

export default VoteGauge;
