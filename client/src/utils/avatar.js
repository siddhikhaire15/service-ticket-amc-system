// client/src/utils/avatar.js

export function getAvatarUrl(email) {
  if (!email) {
    return "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    email
  )}&background=0D8ABC&color=fff&size=256`;
}
