export const DateTime = ({ dateTime }) => {
  // Ensure dateTime is defined before accessing properties
  if (!dateTime || !dateTime.seconds) return null;

  return (
    <>
      <span>
        {new Date(dateTime?.seconds * 1000).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}{" "}
        {new Date(dateTime?.seconds * 1000).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
    </>
  );
};
