import { ethers } from "ethers";

export default new ethers.providers.EtherscanProvider(
  "homestead",
  process.env.ETHERSCAN_KEY ?? undefined
);
