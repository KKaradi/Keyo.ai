import { NextPage } from "next/types";
import GaugeChart from "react-gauge-chart";
import styles from "../styles/components/Header.module.css";

type VoteGaugeProps = {
  votes: number;
  percentiles: number[];
};

const VoteGauge: NextPage<VoteGaugeProps> = ({ votes, percentiles }) => {
  const index = percentiles.indexOf(votes);
  const percent = index == -1 ? 0 : index / (percentiles.length - 1);
  return (
    <div className={styles.chartContainer}>
      <GaugeChart
        id="chart"
        className={styles.chart}
        percent={percent}
        hideText
        colors={["#FF0000", "#FFFF00", "#00FF00"]}
        needleColor="#FFFFFF"
        needleBaseColor="#FFFFFF"
      />
    </div>
  );
};

export default VoteGauge;
