import { useEffect, useState } from "react";
import { useChannel, readLastAblyMessage } from "@/hooks/useChannel";
import { parseSms } from "../parseSms";
import styles from "./results.module.css";

export default function ResultsComponent({ question }) {
  const initialScores = {};
  question.options.map((x) => x.key).forEach((i) => (initialScores[i] = 0));
  const [votes, setVotes] = useState(initialScores);

  const [statusChannel] = readLastAblyMessage(
    "sms-notifications-votes",
    async (lastMessage) => {
      setVotes(lastMessage.data);
    }
  );

  const [channel, ably] = useChannel("sms-notifications", async (message) => {
    // First parse and normalise the SMS using the code in parseSms.js
    // This code converts our dates into a human readable format
    // and makes sure our strings are all trimmed.

    const sms = parseSms(message);
    const value = sms.text.toUpperCase();

    // Read the upper cased value from the SMS - expected to be A-D
    // Then clone the votes object, and increment whichever option
    // the user voted for, before calling setVotes again
    // to update the votes stored in the state.

    const updatedVotes = { ...votes };
    updatedVotes[value]++;
    setVotes(updatedVotes);

    // Publish the updated votes to the `voteSummary` channel
    // so any new joiners can load this state when they first load
    // the application.

    statusChannel.publish({ name: "voteSummary", data: updatedVotes });
  });

  const totalVotes = getTotalVotes(votes);
  const itemsForDisplay = decorateOptionsWithVotes(question.options, votes);

  const displayItems = itemsForDisplay.map((opt) => (
    <li key={opt.key} className={styles.vote} title={opt.text}>
      <span className={styles.number}>{opt.votes}</span>
      <span
        className={styles.bar}
        style={{ height: opt.votePercentage }}
      ></span>
    </li>
  ));

  function getTotalVotes(votes) {
    return Object.values(votes).reduce((a, b) => a + b);
  }

  function decorateOptionsWithVotes(options, votes) {
    const totalVotes = getTotalVotes(votes);
    const optionsWithVotes = [...options];

    optionsWithVotes.forEach((option) => {
      const voteCount = votes[option.key];
      const percent = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;
      option.votes = voteCount;
      option.votePercentage = Math.floor(percent) + "%";
    });

    return optionsWithVotes;
  }
  return (
    <>
      <ul className={styles.votes}>{displayItems}</ul>
      <div className={styles.total}>
        Total votes: <b>{totalVotes}</b>
      </div>
    </>
  );
}
