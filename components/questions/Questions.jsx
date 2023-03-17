import styles from "./questions.module.css";

export default function QuestionsComponent(props) {
  const { question } = props;
  const itemsForDisplay = question.options;
  const displayItems = itemsForDisplay.map((opt) => (
    <li key={opt.key} className={styles.answer}>
      <span className={styles.text}>{opt.text}</span>
      <img className={styles.image} src={opt.src} alt={opt.text} />
      <span className={styles.letter}>{opt.key}</span>
    </li>
  ));
  return (
    <div>
      <h1 className={styles.question}>{question.text}</h1>
      <ul className={styles.answers}>{displayItems}</ul>
    </div>
  );
}
