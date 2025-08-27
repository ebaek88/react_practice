const Notification = ({ message }) => {
  const keywords = ["Added", "Deleted", "Updated", "Welcome", "successfully"];

  if (message === null) {
    return null;
  }

  return (
    <div
      className={
        keywords.some((keyword) => message.includes(keyword))
          ? "success"
          : "error"
      }
    >
      {message}
    </div>
  );
};

export default Notification;
