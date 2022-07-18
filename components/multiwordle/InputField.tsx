import { NextPage } from "next";
import styles from "../../styles/components/multiwordle/InputField.module.css";

type InputFieldProps = {
  input: string;
};

const buildDivs = (input: string) => {
    return input.split(",").map((split, idx) => {
        return (
        <div key={idx} className={styles.inputFieldChar}>
            {split}
        </div>
        );
    });

}

const InputField: NextPage<InputFieldProps> = ({ input }) => {



  return <div className = {styles.body}>{buildDivs(input)}</div>;
};

export default InputField;
