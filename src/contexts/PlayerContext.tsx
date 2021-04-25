import { createContext, ReactNode, useContext, useState } from 'react';

interface Episode {
  title: string;
  members: string;
  thumbnail: string;
  file: {
    duration: number;
    durationAsString: string;
    url: string;
  };
}

interface PlayerContextData {
  episodeList: Episode[];
  currentEpisodeIndex: number;
  isEpisodePlaying: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  play: (episode: Episode) => void;
  playList: (list: Episode[], index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setPlayingState: (state: boolean) => void;
}

interface PlayerProviderProps {
  children: ReactNode;
}

const PlayerContext = createContext({} as PlayerContextData);

export function PlayerProvider({ children }: PlayerProviderProps): JSX.Element {
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isEpisodePlaying, setIsEpisodePlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  function play(episode: Episode): void {
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setIsEpisodePlaying(true);
  }

  function playList(list: Episode[], index: number): void {
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsEpisodePlaying(true);
  }

  function togglePlay(): void {
    setIsEpisodePlaying(!isEpisodePlaying);
  }

  function toggleLoop(): void {
    setIsLooping(!isLooping);
  }

  function toggleShuffle(): void {
    setIsShuffling(!isShuffling);
  }

  function setPlayingState(state: boolean): void {
    setIsEpisodePlaying(state);
  }

  const hasNext = isShuffling || currentEpisodeIndex + 1 < episodeList.length;
  const hasPrevious = currentEpisodeIndex > 0;

  function playNext(): void {
    if (isShuffling) {
      const nextRandomEpisodeIndex = Math.floor(
        Math.random() * episodeList.length
      );
      setCurrentEpisodeIndex(nextRandomEpisodeIndex);
    } else if (hasNext) setCurrentEpisodeIndex(oldValue => oldValue + 1);
  }

  function playPrevious(): void {
    if (hasPrevious) setCurrentEpisodeIndex(oldValue => oldValue - 1);
  }

  return (
    <PlayerContext.Provider
      value={{
        episodeList,
        currentEpisodeIndex,
        hasNext,
        hasPrevious,
        play,
        playList,
        playNext,
        playPrevious,
        isEpisodePlaying,
        isLooping,
        isShuffling,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextData {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }

  return context;
}
