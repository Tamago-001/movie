import { create } from 'zustand';

export interface MediaFile {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'other';
  url: string;
}

export interface Clip {
  id: string;
  mediaId?: string;
  name: string;
  url?: string;
  start: number;
  duration: number;
  // テロップ用の拡張プロパティ
  text?: string;
  fadeIn?: number;
  fadeOut?: number;
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'text';
  clips: Clip[];
}

interface EditorState {
  mediaFiles: MediaFile[];
  currentVideoUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  tracks: Track[];
  selectedClipId: string | null;
  
  addMediaFile: (file: File) => void;
  setCurrentVideoUrl: (url: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  addClipToTimeline: (mediaFile: MediaFile) => void;
  addTextClipToTimeline: () => void;
  setSelectedClipId: (clipId: string | null) => void;
  updateClipProperties: (clipId: string, properties: Partial<Clip>) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  mediaFiles: [],
  currentVideoUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  selectedClipId: null,

  // トラック初期構成
  tracks: [
    { id: 'track-t1', type: 'text', clips: [] },
    { id: 'track-v1', type: 'video', clips: [] },
    { id: 'track-a1', type: 'audio', clips: [] },
  ],

  addMediaFile: (file) => set((state) => {
    const type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'other';
    const newFile: MediaFile = {
      id: crypto.randomUUID(),
      name: file.name,
      type,
      url: URL.createObjectURL(file),
    };
    const shouldSetCurrent = !state.currentVideoUrl && type === 'video';
    return {
      mediaFiles: [...state.mediaFiles, newFile],
      currentVideoUrl: shouldSetCurrent ? newFile.url : state.currentVideoUrl,
    };
  }),

  setCurrentVideoUrl: (url) => set({ currentVideoUrl: url, isPlaying: false, currentTime: 0 }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),

  addClipToTimeline: (mediaFile) => set((state) => {
    const isVideo = mediaFile.type === 'video';
    const targetTrackId = isVideo ? 'track-v1' : 'track-a1';
    
    const newTracks = state.tracks.map(track => {
      if (track.id !== targetTrackId) return track;
      const lastClip = track.clips[track.clips.length - 1];
      const start = lastClip ? lastClip.start + lastClip.duration : 0;
      
      const newClip: Clip = {
        id: crypto.randomUUID(),
        mediaId: mediaFile.id,
        name: mediaFile.name,
        url: mediaFile.url,
        start,
        duration: 10,
      };
      return { ...track, clips: [...track.clips, newClip] };
    });

    const updates: Partial<EditorState> = { tracks: newTracks };
    if (isVideo) updates.currentVideoUrl = mediaFile.url;
    return updates;
  }),

  addTextClipToTimeline: () => set((state) => {
    const targetTrackId = 'track-t1';
    const newTracks = state.tracks.map(track => {
      if (track.id !== targetTrackId) return track;
      const lastClip = track.clips[track.clips.length - 1];
      const start = lastClip ? lastClip.start + lastClip.duration : 0;
      
      const newClip: Clip = {
        id: crypto.randomUUID(),
        name: 'テキストテロップ',
        start,
        duration: 5,
        text: 'ここにテキストを入力',
        fadeIn: 0.5,
        fadeOut: 0.5,
      };
      return { ...track, clips: [...track.clips, newClip] };
    });
    return { tracks: newTracks };
  }),

  setSelectedClipId: (clipId) => set({ selectedClipId: clipId }),

  updateClipProperties: (clipId, properties) => set((state) => ({
    tracks: state.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip => 
        clip.id === clipId ? { ...clip, ...properties } : clip
      )
    }))
  })),
}));