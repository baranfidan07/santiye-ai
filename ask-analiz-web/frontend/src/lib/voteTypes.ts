// Dynamic Vote Types for Jury Confessions
// AI will select the most appropriate vote type based on the confession content

export interface VoteType {
    id: string;
    labelPositive: { tr: string; en: string };
    labelNegative: { tr: string; en: string };
    emoji: { positive: string; negative: string };
    keywords: string[]; // Keywords AI uses to match scenarios
}

export const VOTE_TYPES: VoteType[] = [
    {
        id: "red_flag",
        labelPositive: { tr: "Red Flag Var", en: "Red Flag" },
        labelNegative: { tr: "Yok", en: "No Flag" },
        emoji: { positive: "🚩", negative: "✅" },
        keywords: ["şüphe", "güven", "yalan", "aldatma", "gizli", "suspicious", "trust", "cheating"]
    },
    {
        id: "talk_or_ignore",
        labelPositive: { tr: "Konuş", en: "Talk" },
        labelNegative: { tr: "Boşver", en: "Ignore" },
        emoji: { positive: "💬", negative: "🤐" },
        keywords: ["mesaj", "cevap", "konuşma", "tartışma", "message", "reply", "discuss"]
    },
    {
        id: "stay_or_leave",
        labelPositive: { tr: "Devam Et", en: "Stay" },
        labelNegative: { tr: "Uzaklaş", en: "Leave" },
        emoji: { positive: "💕", negative: "🚪" },
        keywords: ["ilişki", "ayrılık", "devam", "bitir", "relationship", "break up", "end"]
    },
    {
        id: "text_or_not",
        labelPositive: { tr: "Mesaj At", en: "Text Them" },
        labelNegative: { tr: "Atma", en: "Don't" },
        emoji: { positive: "📱", negative: "🙅" },
        keywords: ["ilk mesaj", "yazmalı", "yaz", "text first", "should I message"]
    },
    {
        id: "apologize_or_stand",
        labelPositive: { tr: "Özür Dile", en: "Apologize" },
        labelNegative: { tr: "Duruşunu Koru", en: "Stand Firm" },
        emoji: { positive: "🙏", negative: "💪" },
        keywords: ["özür", "hata", "yanlış", "kavga", "sorry", "mistake", "fight", "argument"]
    },
    {
        id: "set_boundary",
        labelPositive: { tr: "Sınır Koy", en: "Set Boundary" },
        labelNegative: { tr: "Tolere Et", en: "Tolerate" },
        emoji: { positive: "🛑", negative: "😌" },
        keywords: ["sınır", "saygısızlık", "kabul", "boundary", "disrespect", "accept"]
    },
    {
        id: "overreacting",
        labelPositive: { tr: "Normal Tepki", en: "Normal" },
        labelNegative: { tr: "Abartıyorsun", en: "Overreacting" },
        emoji: { positive: "😌", negative: "🎭" },
        keywords: ["abartı", "paranoya", "aşırı", "overreact", "paranoid", "too much"]
    },
    {
        id: "suspicious",
        labelPositive: { tr: "Şüphe Var", en: "Suspicious" },
        labelNegative: { tr: "Şüphe Yok", en: "Not Suspicious" },
        emoji: { positive: "🤔", negative: "😇" },
        keywords: ["şüpheli", "garip", "tuhaf", "weird", "strange", "off"]
    },
    {
        id: "toxic_or_valid",
        labelPositive: { tr: "Haklı", en: "Valid" },
        labelNegative: { tr: "Haksız", en: "Invalid" },
        emoji: { positive: "✅", negative: "❌" },
        keywords: ["haklı", "haksız", "doğru", "yanlış", "right", "wrong"]
    },
    {
        id: "jealous_or_careful",
        labelPositive: { tr: "Kıskançlık", en: "Jealousy" },
        labelNegative: { tr: "Dikkatli Olmak", en: "Being Careful" },
        emoji: { positive: "💚", negative: "👀" },
        keywords: ["kıskanç", "başkası", "arkadaş", "jealous", "other", "friends"]
    },
    {
        id: "love_bomb",
        labelPositive: { tr: "Love Bombing", en: "Love Bombing" },
        labelNegative: { tr: "Gerçek Aşk", en: "Real Love" },
        emoji: { positive: "💣", negative: "💝" },
        keywords: ["çok hızlı", "aşırı ilgi", "too fast", "too much attention", "overwhelming"]
    },
    {
        id: "gaslight",
        labelPositive: { tr: "Gaslighting", en: "Gaslighting" },
        labelNegative: { tr: "Yanlış Anlama", en: "Misunderstanding" },
        emoji: { positive: "🔥", negative: "🤷" },
        keywords: ["inkar", "hafıza", "deli", "deny", "memory", "crazy", "imagining"]
    }
];

// Default vote type for confessions without AI selection
export const DEFAULT_VOTE_TYPE = "toxic_or_valid";

// Get vote type by ID
export function getVoteType(id: string): VoteType {
    return VOTE_TYPES.find(v => v.id === id) || VOTE_TYPES.find(v => v.id === DEFAULT_VOTE_TYPE)!;
}

// Get all vote type IDs for AI prompt
export function getVoteTypeIds(): string[] {
    return VOTE_TYPES.map(v => v.id);
}
