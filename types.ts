export type Tab = 'chat' | 'moments' | 'game' | 'story' | 'settings';

export enum StoryView {
    MENU = 'MENU',
    LOAD = 'LOAD',
    SETTINGS = 'SETTINGS',
    CG_GALLERY = 'CG_GALLERY',
    CG_PREVIEW = 'CG_PREVIEW',
    VN_SCENE = 'VN_SCENE'
}

export enum GameView {
    MENU = 'MENU',
    BOARD = 'BOARD'
}

export interface CGItem {
    id: number;
    title: string;
    chapter: string;
    image: string;
    isLocked: boolean;
    isNew?: boolean;
    desc?: string;
    date?: string;
}

export interface StorySave {
    id: number;
    title: string;
    date: string;
    time: string;
    type: 'AUTO' | 'MANUAL';
}

export interface MomentComment {
    id: number;
    user: string;
    avatar: string;
    content: string;
    time: string;
    likes: number;
    isLiked: boolean;
}

export interface Moment {
    id: number;
    avatar: string;
    name: string;
    time: string;
    loc?: string;
    image?: string;
    likes: number;
    isLiked: boolean;
    comments: MomentComment[];
    content: string;
    tags?: string[];
    rotation: string;
}
