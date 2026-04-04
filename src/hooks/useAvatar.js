import { useAvatarContext } from '../context/AvatarContext.jsx';

export function useAvatar() {
  const ctx = useAvatarContext();
  if (!ctx) throw new Error('useAvatar must be used inside <AvatarProvider>');
  const { speak, loading, message } = ctx;
  return { speak, isLoading: loading, isPlaying: message !== null };
}
