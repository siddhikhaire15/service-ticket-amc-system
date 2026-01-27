export default function ProfileCard({ user }) {
  const initials = user.email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {initials}
        </div>

        <div>
          <div className="text-white text-lg font-semibold">
            {user.name || user.email}
          </div>
          <div className="text-white/60 text-sm">{user.email}</div>
          <div className="mt-1 inline-block px-2 py-0.5 rounded bg-white/10 text-xs text-white">
            {user.role.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
