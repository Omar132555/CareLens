function UserProfile({ title = "" }) {
  const initials = title
    ? title.substring(0, 2).toUpperCase()
    : "NA";

  return (
    <div className="avatar-circle">
      {initials}
    </div>
  );
}

export default UserProfile;