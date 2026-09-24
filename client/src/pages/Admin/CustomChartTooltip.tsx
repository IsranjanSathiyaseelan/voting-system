import styles from "./AdminDashboard.module.css";

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomChartTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{`Date: ${label}`}</p>
        <p className={styles.tooltipValue}>
          <span className={styles.tooltipDot} />
          {`Votes: ${payload[0].value}`}
        </p>
      </div>
    );
  }
  return null;
};

export default CustomChartTooltip;
