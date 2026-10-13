"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import { sound } from "../../lib/sound";
import { supabase } from "../../lib/auth";
import {
  ArrowUpRight,
  Search,
  Sparkles,
  Shuffle,
  Plus,
  Heart,
  X,
  Compass,
  FlaskConical,
  Bookmark,
  Orbit,
  Users,
  SlidersHorizontal,
  ArrowRight,
  Star,
  CheckCircle2,
  EyeOff,
  Fingerprint,
  Zap,
  Sliders,
  Film,
  RotateCcw,
  Sparkle,
  Volume2,
  VolumeX,
  Globe,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Menu,
  Edit3,
  LogOut,
  Download,
  ChevronUp,
  Flame,
} from "lucide-react";
import { WatchModal } from "../../components/watch-modal";
import { SearchModal } from "../../components/search-modal";
import { MovieModal } from "../../components/movie-modal";
import { ProfileModal } from "../../components/profile-modal";
import { RolodexRing } from "../../components/rolodex-ring";
import { ParticleCloak } from "../../components/particle-cloak";
import { redirectToStreamPlayer } from "../../lib/stream";

type Confidence = {
  overall: number;
  story: number;
  genre: number;
  director: number;
  community: number;
};

type MovieJourneyItem = {
  id: number;
  title: string;
  year: number;
  poster: string | null;
};

type Movie = {
  id: number;
  title: string;
  year: number;
  genres: string[];
  overview: string;
  poster: string | null;
  runtime: number | null;
  score: number;
  votes: number;
  dna: Record<string, number>;
  reasons: string[];
  match?: number | null;
  confidence?: Confidence;
  why?: string;
  credits?: any;
  director?: string;
  stars?: string[];
  imdbRating?: string;
  metascore?: number;
  contentRating?: string;
  tagline?: string;
  journey?: {
    previous: MovieJourneyItem[];
    current: MovieJourneyItem;
    next: MovieJourneyItem[];
  };
};
type Entry = {
  movie: Movie;
  watchlist: boolean;
  favorite: boolean;
  watched: boolean;
  dismissed: boolean;
  rating: number | null;
};

const RESEARCH_MOODS = [
  { id: "Sad", emoji: "😭", label: "Sad", desc: "Emotional releases & bittersweet dramas" },
  { id: "Romantic", emoji: "😍", label: "Romantic", desc: "Passionate chemistry & heartfelt love" },
  { id: "Funny", emoji: "😂", label: "Funny", desc: "Laugh-out-loud humor & feel-good vibes" },
  { id: "Scary", emoji: "😱", label: "Scary", desc: "Spine-chilling dread & intense horror" },
  { id: "Mind-bending", emoji: "🤯", label: "Mind-bending", desc: "Reality paradoxes & cosmic mystery" },
  { id: "Relaxed", emoji: "😌", label: "Relaxed", desc: "Gentle pacing & comforting escapism" },
  { id: "Motivational", emoji: "🔥", label: "Motivational", desc: "Triumph over adversity & heroic drive" },
  { id: "Bored", emoji: "🥱", label: "Bored", desc: "Relentless velocity & high-octane thrills" },
];

const COLD_START_MOVIES = [
  { id: 1, title: "Toy Story", year: 1995, genre: "Animation / Adventure", poster: "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg" },
  { id: 6, title: "Heat", year: 1995, genre: "Action / Crime", poster: "/umSVjVdbVwtx5ryCA2QXL44Durm.jpg" },
  { id: 10, title: "GoldenEye", year: 1995, genre: "Action / Thriller", poster: "/z0ljRnNxIO7CRBhLEO0DvLgAFPR.jpg" },
  { id: 16, title: "Casino", year: 1995, genre: "Crime / Drama", poster: "/6zEZY1htzRos2w0W3T7o7W1WJhp.jpg" },
  { id: 32, title: "Twelve Monkeys", year: 1995, genre: "Sci-Fi / Mystery", poster: "/gt3iyguaCIw8DpQZI1LIN5TohM2.jpg" },
  { id: 39, title: "Clueless", year: 1995, genre: "Comedy / Romance", poster: "/8AwVTcgpTnmeOs4TdTWqcFDXEsA.jpg" },
  { id: 47, title: "Seven (Se7en)", year: 1995, genre: "Mystery / Thriller", poster: "/6yoghtyTpznpBik8EngEmJskVUO.jpg" },
  { id: 50, title: "The Usual Suspects", year: 1995, genre: "Crime / Mystery", poster: "/bUPmtQzrRhzqYySeiMpv7GurAfm.jpg" },
  { id: 70, title: "From Dusk Till Dawn", year: 1996, genre: "Action / Horror", poster: "/sV3kIAmvJ9tPz4Lq5fuf9LLMxte.jpg" },
  { id: 2, title: "Jumanji", year: 1995, genre: "Adventure / Fantasy", poster: "/vgpXmVaVyUL7GGiDeiK1mKEKzcX.jpg" },
  { id: 25, title: "Leaving Las Vegas", year: 1995, genre: "Drama / Romance", poster: "/nqc2LaUWB4ePf6IqpJ6D8apBDvn.jpg" },
  { id: 17, title: "Sense and Sensibility", year: 1995, genre: "Drama / Romance", poster: "/cBK2yL3HqhFvIVd7lLtazWlRZPR.jpg" },
];

const moods = [
  "Mind-bending",
  "Comfort",
  "Adrenaline",
  "Heartfelt",
  "Dark",
  "Wonder",
];
const moodIcons = ["◈", "☀", "ϟ", "♡", "☾", "✧"];

const LAB_STEPS = [
  {
    id: "dna",
    number: "01",
    title: "Vector Taste DNA",
    icon: Fingerprint,
    tag: "NEURAL MODELING",
    summary:
      "Every film is mapped across 64 multi-dimensional vectors—measuring atmosphere, visual texture, emotional complexity, and thematic depth.",
  },
  {
    id: "mood",
    number: "02",
    title: "Instant Mood Synesthesia",
    icon: Zap,
    tag: "DYNAMIC ROTATION",
    summary:
      "Tired of generic categories? Select your current psychological state. Our recommendation matrix instantly shifts weights to match your exact vibe.",
  },
  {
    id: "curation",
    number: "03",
    title: "Zero Algorithmic Traps",
    icon: Compass,
    tag: "HUMAN-FIRST CURATION",
    summary:
      "No corporate studio sponsorships. No infinite social media doom loops. Only cinema crafted for genuine emotional resonance and authentic discovery.",
  },
  {
    id: "fusion",
    number: "04",
    title: "Movie DNA Fusion",
    icon: FlaskConical,
    tag: "HYBRID SYNTHESIS",
    summary:
      "Combine the cinematic genomes of two or three masterpieces to discover rare crossover films bridging their styles.",
  },
];

const LAB_MOODS = [
  {
    id: "adrenaline",
    label: "⚡ Adrenaline",
    genre: "Action",
    match: "Mad Max: Fury Road (99.2%) · Dune: Part Two (98.6%) · The Dark Knight (97.9%)",
    query: "high-octane action kinetic intensity",
  },
  {
    id: "mindbending",
    label: "◈ Mind-bending",
    genre: "Sci-Fi",
    match: "Inception (99.8%) · Arrival (99.1%) · Primer (96.5%)",
    query: "mind-bending philosophical time paradox",
  },
  {
    id: "heartfelt",
    label: "♡ Heartfelt",
    genre: "Drama",
    match: "Past Lives (99.4%) · Before Sunrise (98.9%) · Her (97.3%)",
    query: "tender emotional heartfelt romance",
  },
  {
    id: "comfort",
    label: "☀ Comfort",
    genre: "Animation",
    match: "Spirited Away (99.7%) · Amélie (98.4%) · Paddington 2 (98.1%)",
    query: "warm cozy heartwarming comfort nostalgic",
  },
  {
    id: "dark",
    label: "☾ Dark & Noir",
    genre: "Crime",
    match: "The Batman (98.9%) · Prisoners (98.4%) · Se7en (98.0%)",
    query: "dark gritty atmospheric psychological thriller crime",
  },
  {
    id: "wonder",
    label: "✧ Cosmic Wonder",
    genre: "Sci-Fi",
    match: "Interstellar (99.6%) · 2001: A Space Odyssey (99.1%) · Contact (97.8%)",
    query: "cosmic awe existential space exploration",
  },
  {
    id: "drama",
    label: "🔥 Intense Drama",
    genre: "Drama",
    match: "Whiplash (99.3%) · Oppenheimer (98.7%) · There Will Be Blood (98.2%)",
    query: "intense gripping masterclass dramatic",
  },
  {
    id: "whimsical",
    label: "🍃 Whimsical",
    genre: "Comedy",
    match: "The Grand Budapest Hotel (99.1%) · Fantastic Mr. Fox (98.5%) · Moonrise Kingdom (97.9%)",
    query: "quirky visual aesthetic whimsical comedy",
  },
];

type TasteArchetype = {
  name: string;
  icon: string;
  genres: string[];
  sample: string;
  dna: Record<string, number>;
};

const TASTE_ARCHETYPES: TasteArchetype[] = [
  {
    name: "Sci-Fi Visionary",
    icon: "🌌",
    genres: ["Sci-Fi", "Mystery", "Thriller"],
    sample: "Interstellar, 2001, Blade Runner 2049",
    dna: { "Mind-bending": 0.98, Wonder: 0.94, Adrenaline: 0.72, Dark: 0.65 },
  },
  {
    name: "Art-House & Aesthetic",
    icon: "🎨",
    genres: ["Drama", "Romance", "Comedy"],
    sample: "The Grand Budapest Hotel, Amélie, Past Lives",
    dna: { Heartfelt: 0.96, Comfort: 0.88, Wonder: 0.82, "Mind-bending": 0.6 },
  },
  {
    name: "Adrenaline Junkie",
    icon: "⚡",
    genres: ["Action", "Adventure", "Thriller"],
    sample: "Mad Max: Fury Road, Dune, The Dark Knight",
    dna: { Adrenaline: 0.99, Dark: 0.85, "Mind-bending": 0.7, Wonder: 0.75 },
  },
  {
    name: "Atmospheric & Cozy",
    icon: "☕",
    genres: ["Animation", "Children", "Comedy"],
    sample: "Spirited Away, Paddington 2, My Neighbor Totoro",
    dna: { Comfort: 0.99, Heartfelt: 0.92, Wonder: 0.85, "Mind-bending": 0.3 },
  },
  {
    name: "Psychological Noir",
    icon: "🕵️",
    genres: ["Crime", "Horror", "Thriller"],
    sample: "Taxi Driver, No Country for Old Men, Shutter Island",
    dna: { Dark: 0.99, "Mind-bending": 0.91, Adrenaline: 0.78, Heartfelt: 0.4 },
  },
];

const LEGENDARY_FUSIONS = [
  {
    titles: ["Interstellar", "2001: A Space Odyssey"],
    tag: "Cosmic Odyssey",
    desc: "Epic scope meets existential silence and mind-bending space exploration.",
  },
  {
    titles: ["Inception", "Shutter Island"],
    tag: "Psychological Labyrinth",
    desc: "Architectural dream logic fused with haunting neo-noir reality distortion.",
  },
  {
    titles: ["Spirited Away", "Princess Mononoke"],
    tag: "Mythic Ghibli",
    desc: "Enchanting folklore and environmental wonder with majestic surrealism.",
  },
  {
    titles: ["Blade Runner", "Arrival"],
    tag: "Linguistic Cyberpunk",
    desc: "Moody atmospheric aesthetics paired with profound first-contact linguistics.",
  },
];

type GroupPerson = {
  id: string;
  name: string;
  avatar: string;
  movies: Movie[];
};

const AVATARS = ["🍿", "🎬", "🚀", "🎭", "🥑", "⚡", "🎧", "🕹️"];

const GROUP_VIBES = [
  { id: "crowd_pleaser", label: "🍿 Crowd Pleaser", desc: "Universal appeal & high ratings" },
  { id: "thrills", label: "⚡ High Thrills", desc: "Action, suspense & sci-fi adrenaline" },
  { id: "deep", label: "🍷 Deep & Mind-Bending", desc: "Complex plots & psychological depth" },
  { id: "comedy", label: "😂 Laugh Out Loud", desc: "Breezy comedies & feel-good energy" },
  { id: "wildcard", label: "🎲 Wildcard Discovery", desc: "Rare crossovers & hidden gems" },
];

const GROUP_QUICK_SEEDS = [
  { label: "⚡ Sci-Fi", query: "Interstellar" },
  { label: "🔪 Thriller", query: "Shutter Island" },
  { label: "🌸 Anime", query: "Spirited Away" },
  { label: "😂 Comedy", query: "The Grand Budapest Hotel" },
  { label: "☕ Cozy Drama", query: "Past Lives" },
  { label: "🔥 Action", query: "Mad Max: Fury Road" },
];

function Card({
  movie: m,
  entries,
  save,
  onOpen,
  onWatch,
  isGroupTab,
  voteCount,
  isVetoed,
  onVote,
  onVeto,
  onChooseWinner,
}: {
  movie: Movie;
  entries: Entry[];
  save: (m: Movie, change: object) => Promise<void>;
  onOpen: (m: Movie) => void;
  onWatch?: (m: Movie) => void;
  isGroupTab?: boolean;
  voteCount?: number;
  isVetoed?: boolean;
  onVote?: (m: Movie) => void;
  onVeto?: (m: Movie) => void;
  onChooseWinner?: (m: Movie) => void;
}) {
  const saved = entries.find((e) => e.movie.id === m.id)?.watchlist;
  const [poster, setPoster] = useState(m.poster);
  const [posterFailed, setPosterFailed] = useState(false);
  const recoveryAttempted = useRef(false);
  const hasPoster = Boolean(poster) && !posterFailed;
  async function recoverPoster() {
    if (recoveryAttempted.current) {
      setPosterFailed(true);
      return;
    }
    recoveryAttempted.current = true;
    try {
      const response = await fetch(`/api/movies/${m.id}/artwork`);
      if (!response.ok) throw new Error("Artwork unavailable");
      const result = await response.json();
      if (result.poster && result.poster !== poster) {
        setPoster(result.poster);
        setPosterFailed(false);
      } else setPosterFailed(true);
    } catch {
      setPosterFailed(true);
    }
  }
  useEffect(() => {
    setPoster(m.poster);
    setPosterFailed(false);
    recoveryAttempted.current = false;
    if (!m.poster) void recoverPoster();
  }, [m.id, m.poster]);
  return (
    <motion.article
      className={"movie " + (isVetoed ? "movie-vetoed" : "")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
    >
      <button
        className="poster"
        onClick={() => {
          sound.playClick(600);
          onOpen(m);
        }}
        aria-label={`Explore ${m.title}`}
      >
        {hasPoster ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${poster}`}
            alt={m.title}
            unoptimized
            fill
            sizes="(max-width:700px) 45vw, 18vw"
            onError={() => {
              setPosterFailed(true);
            }}
          />
        ) : (
          <div
            className="movie-poster-clean-fallback"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(145deg, #131b2e 0%, #0a0f1d 50%, #05070d 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              textAlign: "center",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(245, 197, 24, 0.12)",
                border: "1px solid rgba(245, 197, 24, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
                color: "var(--gold, #f5c518)",
              }}
            >
              <Film size={20} />
            </div>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#f8fafc",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
              }}
            >
              {m.title}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(245, 197, 24, 0.85)",
                fontWeight: 600,
                marginTop: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {m.year} · {m.genres?.slice(0, 1).join("") || "Cinema"}
            </span>
          </div>
        )}
        <span className="rating">
          <Star size={11} />
          {m.score.toFixed(1)}
        </span>
        {m.match ? (
          <span className="match-score-pill">
            ⚡ {Math.round(m.match)}%
          </span>
        ) : null}
        <span className="open">
          <ArrowUpRight size={20} />
        </span>
        {onWatch && (
          <button
            type="button"
            className="card-quick-watch-btn"
            title={`Watch ${m.title} Trailer`}
            onClick={(e) => {
              e.stopPropagation();
              sound.playChime();
              onWatch(m);
            }}
          >
            <Play size={11} fill="currentColor" /> Trailer
          </button>
        )}
      </button>
      <button
        className={"save " + (saved ? "saved" : "")}
        onClick={(e) => {
          e.stopPropagation();
          sound.playClick(saved ? 420 : 700);
          save(m, { watchlist: !saved });
        }}
        aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      >
        {saved ? "✓" : <Plus size={16} />}
      </button>
      <h3>{m.title}</h3>
      <p>
        {m.year || "Year unknown"} <span>·</span>{" "}
        {m.genres.slice(0, 2).join(" / ")}
      </p>
      {m.director && (
        <div className="card-director-line">Dir. {m.director}</div>
      )}
      {m.why ? (
        <div className="card-why-text">✦ {m.why}</div>
      ) : m.reasons?.length > 0 ? (
        <small>{m.reasons[0]}</small>
      ) : null}

      <div className="card-quick-actions-bar">
        {onWatch && (
          <button
            type="button"
            className="card-action-watch"
            title={`Watch ${m.title} Trailer`}
            onClick={(e) => {
              e.stopPropagation();
              sound.playChime();
              onWatch(m);
            }}
          >
            <Play size={12} fill="currentColor" /> Trailer
          </button>
        )}
        <button
          type="button"
          className="card-action-details"
          onClick={() => {
            sound.playClick(550);
            onOpen(m);
          }}
        >
          Details
        </button>
      </div>

      {isGroupTab && (
        <div className="group-card-actions">
          <button
            type="button"
            className="group-vote-btn"
            onClick={(e) => {
              e.stopPropagation();
              onVote?.(m);
            }}
            title="Upvote film"
          >
            👍 {voteCount || 0}
          </button>
          <button
            type="button"
            className={`group-veto-btn ${isVetoed ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onVeto?.(m);
            }}
            title="Veto film"
          >
            🚫 {isVetoed ? "Vetoed" : "Veto"}
          </button>
          <button
            type="button"
            className="group-choose-btn"
            onClick={(e) => {
              e.stopPropagation();
              onChooseWinner?.(m);
            }}
            title="Crown as Tonight's Movie"
          >
            🏆 Crown
          </button>
        </div>
      )}
    </motion.article>
  );
}
export default function Home() {
  const [items, setItems] = useState<Movie[]>([]),
    [total, setTotal] = useState(0),
    [tab, setTab] = useState("Discover"),
    [query, setQuery] = useState(""),
    [mood, setMood] = useState(""),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<Movie | null>(null),
    [watchMovie, setWatchMovie] = useState<Movie | null>(null),
    [searchOpen, setSearchOpen] = useState(false),
    [profileOpen, setProfileOpen] = useState(false),
    [menuOpen, setMenuOpen] = useState(false),
    [entries, setEntries] = useState<Entry[]>([]),
    [dna, setDna] = useState<Record<string, number>>({}),
    [novelty, setNovelty] = useState(0.25),
    [fusion, setFusion] = useState<number[]>([]),
    [fusionMovies, setFusionMovies] = useState<Movie[]>([]),
    [fusionSlotSearch, setFusionSlotSearch] = useState<Record<number, string>>({}),
    [fusionSlotResults, setFusionSlotResults] = useState<Record<number, Movie[]>>({}),
    [mystery, setMystery] = useState(false),
    [authOpen, setAuthOpen] = useState(false),
    [notice, setNotice] = useState(""),
    [saving, setSaving] = useState(0),
    [group, setGroup] = useState<Movie[][]>([[], []]),
    [groupPeople, setGroupPeople] = useState<GroupPerson[]>([
      { id: "p1", name: "Anjan (Host)", avatar: "🍿", movies: [] },
      { id: "p2", name: "Alex (Friend)", avatar: "🎬", movies: [] },
    ]),
    [roomCode, setRoomCode] = useState("MOVIE-7821"),
    [groupVibe, setGroupVibe] = useState("crowd_pleaser"),
    [groupVotes, setGroupVotes] = useState<Record<number, number>>({}),
    [groupVetoes, setGroupVetoes] = useState<Record<number, boolean>>({}),
    [groupWinner, setGroupWinner] = useState<Movie | null>(null),
    [editingPersonIdx, setEditingPersonIdx] = useState<number | null>(null),
    [groupQuery, setGroupQuery] = useState(""),
    [groupResults, setGroupResults] = useState<Movie[]>([]),
    [person, setPerson] = useState(0),
    [stats, setStats] = useState<any>(null),
    [isAdmin, setIsAdmin] = useState(false),
    [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeMode, setActiveMode] = useState("discover");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [genre, setGenre] = useState("");
  const [decade, setDecade] = useState("");
  const [runtime, setRuntime] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sort, setSort] = useState("popular");
  const [categories, setCategories] = useState<
    { name: string; count: number }[]
  >([]);
  const [accountName, setAccountName] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [librarySort, setLibrarySort] = useState("title");

  // Research RecSys Suite State
  const [userProfile, setUserProfile] = useState<{
    genres: Record<string, number>;
    directors: string[];
    actors: string[];
    decades: { era: string; percentage: number }[];
    averageRuntime: string;
    mostWatchedLanguage: string;
    preferredThemes: string[];
    stats2026: { moviesWatched: number; hoursWatched: number; genresExplored: number };
    evolution: { year: string; focus: string; primaryPercent: number }[];
  } | null>(null);
  const [swipeDeck, setSwipeDeck] = useState<Movie[]>([]);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeFeedback, setSwipeFeedback] = useState("");
  const [tonightModalOpen, setTonightModalOpen] = useState(false);
  const [tonightMood, setTonightMood] = useState("Mind-bending");
  const [tonightTime, setTonightTime] = useState("120");
  const [tonightCompany, setTonightCompany] = useState("friends");
  const [tonightLanguage, setTonightLanguage] = useState("all");
  const [tonightResult, setTonightResult] = useState<Movie | null>(null);
  const [tonightAlternates, setTonightAlternates] = useState<Movie[]>([]);
  const [coldStartOpen, setColdStartOpen] = useState(false);
  const [coldStartSelected, setColdStartSelected] = useState<number[]>([]);
  const [friendModalOpen, setFriendModalOpen] = useState(false);
  const [friendName, setFriendName] = useState("Alex");
  const [watchlistCategory, setWatchlistCategory] = useState("all");
  const [showDnaEvolution, setShowDnaEvolution] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(sound.enabled);
  }, []);

  // Global keyboard shortcut for universal search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    sound.enabled = next;
    setSoundOn(next);
    if (next) sound.playChime();
  };

  // In-App Neural Taste Lab state
  const [labStep, setLabStep] = useState("dna");
  const [atmosphereVal, setAtmosphereVal] = useState(70);
  const [pacingVal, setPacingVal] = useState(45);
  const [selectedLabMood, setSelectedLabMood] = useState(1);

  async function profile() {
    const p = await api("/me");
    setEntries(p.items);
    setDna(p.dna);
    if (p.profile) setUserProfile(p.profile);
    setIsAdmin(p.admin);
  }
  const requestVersion = useRef(0);
  async function load(
    mode = "discover",
    nextOffset = 0,
    initialGenre?: string,
    overrides?: {
      query?: string;
      mood?: string;
      genre?: string;
      novelty?: number;
      fusion?: number[];
      company?: string;
    },
    options?: {
      append?: boolean;
    }
  ) {
    const isAppend = Boolean(options?.append || (nextOffset > 0 && options?.append !== false));
    const version = ++requestVersion.current;
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setBusy(true);
    }
    setError("");
    setActiveMode(mode);
    const activeQuery = overrides?.query ?? query;
    const activeMood = overrides?.mood ?? mood;
    const activeGenre = overrides?.genre ?? (initialGenre ?? genre);
    const activeNovelty = overrides?.novelty ?? novelty;
    const activeFusion = overrides?.fusion ?? fusion;
    try {
      const d =
        mode === "catalog"
          ? await api(
              `/movies?offset=${nextOffset}&limit=24&genre=${encodeURIComponent(activeGenre)}&year_from=${decade || 0}&year_to=${decade ? +decade + 9 : 2100}&max_runtime=${runtime || 0}&min_score=${minScore || 0}&sort=${sort}`,
            )
          : mode === "live"
            ? await api("/catalog/live?q=" + encodeURIComponent(activeQuery || "popular"))
            : await api("/discover", {
                query: activeQuery,
                mood: activeMood,
                genre: activeGenre,
                offset: nextOffset,
                limit: 24,
                year_from: Number(decade) || 0,
                year_to: decade ? Number(decade) + 9 : 2100,
                min_score: Number(minScore) || 0,
                max_runtime: Number(runtime) || null,
                novelty: activeNovelty,
                fusion: mode === "fusion" ? activeFusion : [],
                mode,
                company: overrides?.company,
              });
      if (version !== requestVersion.current) return;
      if (d.message && !isAppend) setNotice(d.message);

      if (isAppend) {
        setItems((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const newItems = (d.items || []).filter((m: Movie) => !seen.has(m.id));
          return [...prev, ...newItems];
        });
      } else {
        setItems(d.items || []);
      }
      setTotal(d.total ?? (d.items ? d.items.length : 0));
      setOffset(nextOffset);
      setMystery(mode === "mystery");

      if (mode === "swipe") {
        setSwipeDeck(d.items);
        setSwipeIndex(0);
      }
      if (mode === "tonight") {
        if (d.items && d.items.length > 0) {
          setTonightResult(d.items[0]);
          setTonightAlternates(d.items.slice(1, 3));
        }
      }
      if (mode === "surprise") {
        if (d.items && d.items.length > 0) {
          setSelected(d.items[0]);
          sound.playChime();
        }
      }
      if (["pick", "mystery"].includes(mode) && d.items.length)
        setSelected(d.items[0]);
    } catch (e) {
      if (version === requestVersion.current) setError((e as Error).message);
    } finally {
      if (version === requestVersion.current) {
        setBusy(false);
        setLoadingMore(false);
      }
    }
  }

  async function loadMore() {
    if (busy || loadingMore || offset + 24 >= total) return;
    const nextOffset = offset + 24;
    await load(activeMode, nextOffset, undefined, undefined, { append: true });
  }

  // Continuous Seamless Infinite Scrolling
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          if (!busy && !loadingMore && items.length > 0 && offset + 24 < total) {
            void loadMore();
          }
        }
      },
      { rootMargin: "450px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [busy, loadingMore, items.length, offset, total, activeMode]);

  function getDynamicGreeting() {
    const hour = new Date().getHours();
    const prefix = hour < 12 ? "GOOD MORNING" : hour < 18 ? "GOOD AFTERNOON" : "GOOD EVENING";
    const name = accountName ? accountName.toUpperCase() : "ANJAN";
    return `${prefix}, ${name} 👋`;
  }

  async function triggerSurpriseMe() {
    sound.playChime();
    setNotice("🎲 Rolling serendipity matrix outside your normal recommendation bubble...");
    await load("surprise", 0, undefined, { novelty: 0.85 });
  }

  async function handleSwipe(action: "like" | "dislike" | "star") {
    if (!swipeDeck[swipeIndex]) return;
    const current = swipeDeck[swipeIndex];
    sound.playClick(action === "like" ? 720 : action === "star" ? 840 : 400);

    if (action === "like") {
      save(current, { watchlist: true });
      setSwipeFeedback(`❤️ Saved "${current.title}" · Taste DNA updated (+7% ${current.genres[0] || "affinity"})`);
    } else if (action === "star") {
      save(current, { favorite: true, rating: 5 });
      sound.playChime();
      setSwipeFeedback(`⭐ Must-Watch! "${current.title}" marked as 5-star favorite (+15% ${current.genres[0] || "affinity"})`);
    } else {
      save(current, { dismissed: true });
      setSwipeFeedback(`❌ Passed "${current.title}" · Recalibrating negative vectors`);
    }

    if (swipeIndex + 1 < swipeDeck.length) {
      setSwipeIndex(swipeIndex + 1);
      // Auto-prefetch additional movies when near the end so deck never runs dry
      if (swipeIndex + 4 >= swipeDeck.length) {
        api("/discover", { mode: "swipe", novelty: 0.65, limit: 40 })
          .then((more) => {
            if (more.items?.length > 0) {
              setSwipeDeck((prev) => {
                const existingIds = new Set(prev.map((x) => x.id));
                const uniqueMore = more.items.filter((m: Movie) => !existingIds.has(m.id));
                return [...prev, ...uniqueMore];
              });
            }
          })
          .catch(() => {});
      }
    } else {
      await load("swipe", 0, undefined, { novelty: 0.5 });
    }
  }

  async function refreshSwipeFeed() {
    sound.playChime();
    setNotice("Refreshing feed with fresh movie discoveries...");
    try {
      const res = await api("/discover", { mode: "swipe", novelty: 0.7, limit: 60 });
      if (res.items?.length > 0) {
        setSwipeDeck(res.items);
        setSwipeIndex(0);
        setSwipeFeedback("✦ Feed refreshed with fresh cinema discoveries!");
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function appendMoreToSwipeDeck() {
    sound.playClick(640);
    setNotice("Fetching 30 more movies into your stack...");
    try {
      const res = await api("/discover", { mode: "swipe", novelty: 0.6, limit: 40 });
      if (res.items?.length > 0) {
        setSwipeDeck((prev) => {
          const existingIds = new Set(prev.map((x) => x.id));
          const uniqueMore = res.items.filter((m: Movie) => !existingIds.has(m.id));
          return [...prev, ...uniqueMore];
        });
        setNotice(`Added fresh films to your swipe deck! Total: ${swipeDeck.length + res.items.length}`);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function generateTonightFilm() {
    sound.playChime();
    setBusy(true);
    try {
      const res = await api("/discover", {
        mode: "tonight",
        mood: tonightMood,
        max_runtime: tonightTime === "all" ? null : Number(tonightTime),
        company: tonightCompany,
        limit: 6,
      });
      if (res.items?.length > 0) {
        setTonightResult(res.items[0]);
        setTonightAlternates(res.items.slice(1, 3));
        setNotice(`Generated tonight's ultimate match for ${tonightMood} + ${tonightCompany}!`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitColdStart() {
    if (coldStartSelected.length < 5) return;
    sound.playChime();
    setNotice("Synthesizing your Taste DNA from 5 seminal masterworks...");
    setColdStartOpen(false);
    for (const id of coldStartSelected) {
      await api(`/me/movies/${id}`, { favorite: true, rating: 5, watchlist: true });
    }
    await profile();
    await load("discover", 0, undefined, { novelty: 0.25 });
    setNotice("Taste DNA fully calibrated! Recommendations personalized for you.");
  }

  async function applyDnaToCatalog() {
    sound.playChime();
    let q = "";
    let g = "";
    let nov = 0.25;
    if (atmosphereVal > 60 && pacingVal < 50) {
      q = "cosmic philosophical space contemplation surreal";
      g = "Sci-Fi";
      nov = 0.3;
    } else if (atmosphereVal > 60 && pacingVal >= 50) {
      q = "kinetic cyberpunk high-octane mind-bending futuristic";
      g = "Sci-Fi";
      nov = 0.35;
    } else if (atmosphereVal <= 60 && pacingVal < 50) {
      q = "grounded realism slow-burn psychological crime drama";
      g = "Drama";
      nov = 0.15;
    } else {
      q = "intense action thriller heist kinetic high-octane adrenaline";
      g = "Action";
      nov = 0.3;
    }
    setQuery(q);
    setNotice(`Taste DNA applied (Atmosphere: ${atmosphereVal}%, Pacing: ${pacingVal}%). Feed updated!`);
    await load("discover", 0, undefined, { query: q, genre: g, novelty: nov });
  }

  async function applyMoodToCatalog(moodItem: (typeof LAB_MOODS)[0]) {
    sound.playChime();
    setMood(moodItem.id);
    setQuery(moodItem.query);
    setNotice(`${moodItem.label} synesthesia applied to catalog feed!`);
    await load("discover", 0, undefined, { mood: moodItem.id, query: moodItem.query, genre: moodItem.genre });
  }

  async function calibrateArchetype(archetype: (typeof TASTE_ARCHETYPES)[0]) {
    sound.playChime();
    setDna(archetype.dna);
    setNotice(`${archetype.name} archetype calibrated. Taste DNA updated!`);
    try {
      await api("/me/profile", { genres: archetype.genres });
    } catch {}
    await load("discover", 0, undefined, { query: archetype.sample, novelty: 0.2 });
  }

  function addMovieToFusion(m: Movie) {
    if (fusionMovies.some((x) => x.id === m.id) || fusionMovies.length >= 3) return;
    const next = [...fusionMovies, m];
    setFusionMovies(next);
    setFusion(next.map((x) => x.id));
    setNotice(`Added "${m.title}" to Fusion Bench (${next.length}/3)`);
  }

  function removeMovieFromFusion(id: number) {
    const next = fusionMovies.filter((x) => x.id !== id);
    setFusionMovies(next);
    setFusion(next.map((x) => x.id));
    setNotice(`Removed film from Fusion Bench (${next.length}/3)`);
  }

  async function searchMovieForSlot(slotIdx: number, q: string) {
    setFusionSlotSearch((prev) => ({ ...prev, [slotIdx]: q }));
    if (!q.trim()) {
      setFusionSlotResults((prev) => ({ ...prev, [slotIdx]: [] }));
      return;
    }
    try {
      const d = await api("/movies?q=" + encodeURIComponent(q) + "&limit=4");
      setFusionSlotResults((prev) => ({ ...prev, [slotIdx]: d.items || [] }));
    } catch {}
  }

  function addMovieToActivePerson(movie: Movie) {
    sound.playClick(680);
    setGroupPeople((prev) =>
      prev.map((p, idx) => {
        if (idx !== person) return p;
        if (p.movies.some((m) => m.id === movie.id)) return p;
        return { ...p, movies: [...p.movies, movie] };
      })
    );
    setNotice(`Added "${movie.title}" for ${groupPeople[person]?.name || "Person"}`);
  }

  async function addQuickSeedToPerson(seed: (typeof GROUP_QUICK_SEEDS)[0]) {
    sound.playClick(600);
    try {
      const res = await api(`/movies?q=${encodeURIComponent(seed.query)}&limit=1`);
      if (res.items?.[0]) {
        addMovieToActivePerson(res.items[0]);
      }
    } catch {}
  }

  function removeMovieFromPerson(personIdx: number, movieId: number) {
    sound.playClick(400);
    setGroupPeople((prev) =>
      prev.map((p, idx) =>
        idx === personIdx
          ? { ...p, movies: p.movies.filter((m) => m.id !== movieId) }
          : p
      )
    );
  }

  function addPerson() {
    sound.playClick(550);
    if (groupPeople.length >= 8) return;
    const nextIdx = groupPeople.length;
    const newP: GroupPerson = {
      id: `p${Date.now()}`,
      name: `Person ${nextIdx + 1}`,
      avatar: AVATARS[nextIdx % AVATARS.length],
      movies: [],
    };
    setGroupPeople([...groupPeople, newP]);
    setPerson(nextIdx);
    setNotice(`Added ${newP.name} to the co-watch party!`);
  }

  function removePerson(idx: number) {
    sound.playClick(400);
    if (groupPeople.length <= 2) return;
    const next = groupPeople.filter((_, i) => i !== idx);
    setGroupPeople(next);
    if (person >= next.length) setPerson(next.length - 1);
  }

  function updatePersonName(idx: number, name: string) {
    setGroupPeople((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, name } : p))
    );
  }

  function copyRoomLink() {
    sound.playChime();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://cineverseai.vercel.app";
    const url = `${origin}/discover?tab=Group+night&room=${roomCode}`;
    navigator.clipboard?.writeText(url);
    setNotice(`Copied room invite link (${roomCode}) to clipboard! Share with your friends.`);
  }

  async function computeCommonGround() {
    sound.playChime();
    const version = ++requestVersion.current;
    setBusy(true);
    setError("");
    setGroupWinner(null);
    setGroupVotes({});
    setGroupVetoes({});
    try {
      const favorites = groupPeople.map((p) => p.movies.map((m) => m.id));
      const personNames = groupPeople.map((p) => p.name);
      const d = await api("/group", { favorites, vibe: groupVibe, personNames });
      if (version !== requestVersion.current) return;
      setItems(d.items);
      setTotal(d.items.length);
      setNotice(`Generated consensus shortlist across ${groupPeople.length} watchers!`);
    } catch (e) {
      if (version === requestVersion.current) setError((e as Error).message);
    } finally {
      if (version === requestVersion.current) setBusy(false);
    }
  }

  async function applyLegendaryFusion(pair: (typeof LEGENDARY_FUSIONS)[0]) {
    sound.playChime();
    setBusy(true);
    setNotice(`Synthesizing ${pair.titles.join(" + ")}...`);
    try {
      const matchedMovies: Movie[] = [];
      for (const title of pair.titles) {
        const found = items.find((m) => m.title.toLowerCase().includes(title.toLowerCase()));
        if (found) {
          matchedMovies.push(found);
        } else {
          const res = await api(`/movies?q=${encodeURIComponent(title)}&limit=1`);
          if (res.items?.[0]) matchedMovies.push(res.items[0]);
        }
      }
      if (matchedMovies.length >= 2) {
        setFusionMovies(matchedMovies);
        const ids = matchedMovies.map((m) => m.id);
        setFusion(ids);
        await load("fusion", 0, undefined, { fusion: ids });
        setNotice(`Fused DNA of ${pair.titles.join(" + ")}!`);
      } else {
        await load("discover", 0, undefined, { query: pair.titles.join(" ") });
        setNotice(`Searching for films bridging ${pair.titles.join(" + ")}`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setAuthOpen(false);
      }
    };
    window.addEventListener("keydown", escape);
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) setRoomCode(roomParam);
    const initialGenre = params.get("genre") || "";
    const initialTab = params.get("tab") || "";
    if (
      initialTab &&
      [
        "Discover",
        "Swipe mode",
        "Tonight mode",
        "Taste lab",
        "Watchlist",
        "Favorites",
        "Watch journal",
        "Not for me",
        "Group night",
        "Admin",
        "Galaxy",
      ].includes(initialTab)
    ) {
      setTab(initialTab);
    }
    setGenre(initialGenre);
    load(initialTab === "Taste lab" ? "discover" : "catalog", 0, initialGenre);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.items || []))
      .catch(() => {});
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.name) setAccountName(d.user.name);
      })
      .catch(() => {});
    fetch("/api/me/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d?.name) setAccountName(d.name);
      })
      .catch(() => {});
    supabase?.auth
      .getUser()
      .then(({ data }) => {
        if (data?.user?.email) setAccountName(data.user.email);
      });
    profile().catch(() => {});
    const sub = supabase?.auth.onAuthStateChange(() => {
      setTimeout(() => profile().catch(() => {}), 0);
    });
    return () => {
      sub?.data.subscription.unsubscribe();
      window.removeEventListener("keydown", escape);
    };
  }, []);
  useEffect(() => {
    if (!selected && !authOpen) return;
    const before = document.activeElement as HTMLElement;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const controls = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,select,textarea,a[href]",
        ) ?? [],
      );
    controls()[0]?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = controls(),
        first = els[0],
        last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      before?.focus();
    };
  }, [selected, authOpen]);
  async function save(m: Movie, change: object) {
    setSaving((n) => n + 1);
    try {
      await api(`/me/movies/${m.id}`, change);
      await profile();
      setNotice("Your taste is evolving. Saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving((n) => n - 1);
    }
  }
  async function navigate(name: string) {
    // Dismiss any active modal overlays so navigation is never trapped or blocked
    setSelected(null);
    setTonightModalOpen(false);
    setFriendModalOpen(false);
    setColdStartOpen(false);
    setAuthOpen(false);

    requestVersion.current++;
    setBusy(false);
    setTab(name);
    sound.playClick(600);
    setLibraryQuery("");
    setMystery(false);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", name);
      window.history.pushState(null, "", url.toString());
    } catch {}

    window.scrollTo({ top: 0, behavior: "smooth" });
    const ws = document.querySelector(".workspace");
    if (ws) ws.scrollTo({ top: 0, behavior: "smooth" });

    if (name === "Discover") {
      if (!items.length) load("catalog");
    }
    if (name === "Swipe mode") {
      sound.playChime();
      load("swipe", 0, undefined, { novelty: 0.35 });
      setNotice("Entered Movie Tinder / Swipe Discovery Mode 🎬");
    }
    if (name === "Tonight mode") {
      sound.playChime();
      load("tonight", 0, undefined, { mood: tonightMood, company: tonightCompany });
      setNotice("Tonight Mode: What should we watch tonight?");
    }
    if (name === "Taste lab") {
      sound.playChime();
      if (!items.length) {
        load("discover");
      }
      setNotice("Entered Neural Taste Modeling Studio");
    }
    if (name === "Hidden gems") load("gems");
    if (name === "Admin")
      try {
        setStats(await api("/admin/analytics"));
      } catch (e) {
        setError((e as Error).message);
      }
  }
  const collectionTabs = [
    "Watchlist",
    "Favorites",
    "Watch journal",
    "Not for me",
  ];
  const rawCollection =
    tab === "Watchlist"
      ? entries.filter((e) => e.watchlist).map((e) => e.movie)
      : tab === "Favorites"
        ? entries.filter((e) => e.favorite).map((e) => e.movie)
        : tab === "Watch journal"
          ? entries.filter((e) => e.watched).map((e) => e.movie)
          : tab === "Not for me"
            ? entries.filter((e) => e.dismissed).map((e) => e.movie)
            : items;

  const intelligentCollection =
    tab === "Watchlist" && watchlistCategory !== "all"
      ? rawCollection.filter((m) => {
          if (watchlistCategory === "tonight") return (m.score >= 3.6 && (m.runtime ?? 110) <= 125);
          if (watchlistCategory === "weekend") return ((m.runtime ?? 100) >= 130 || m.genres.includes("Action") || m.genres.includes("Adventure"));
          if (watchlistCategory === "date") return m.genres.some((g) => ["Romance", "Comedy", "Drama"].includes(g));
          if (watchlistCategory === "family") return m.genres.some((g) => ["Animation", "Children", "Fantasy", "Adventure"].includes(g));
          if (watchlistCategory === "mindbending") return m.genres.some((g) => ["Sci-Fi", "Mystery", "Thriller"].includes(g));
          if (watchlistCategory === "short") return (m.runtime && m.runtime <= 95);
          if (watchlistCategory === "comfort") return m.genres.some((g) => ["Comedy", "Animation"].includes(g));
          return true;
        })
      : rawCollection;

  const collection = intelligentCollection;

  const visible = collectionTabs.includes(tab)
    ? collection
        .filter((m) =>
          m.title.toLowerCase().includes(libraryQuery.toLowerCase()),
        )
        .sort((a, b) =>
          librarySort === "rating"
            ? b.score - a.score
            : librarySort === "year"
              ? b.year - a.year
              : a.title.localeCompare(b.title),
        )
    : collection;
  return (
    <div className="shell">
      <aside
        className={`cineverse-sidebar is-complete ${menuOpen ? "mobile-open" : ""}`}
        aria-label="Cineverse Sidebar Navigation"
      >
        {/* Top Header: Brand Logo & Cinema Menu Button */}
        <div className="sidebar-header">
          <Link
            href="/"
            className="sidebar-brand"
            aria-label="Cineverse Home"
            onClick={() => {
              setMenuOpen(false);
              sound.playClick(440);
            }}
          >
            <span className="brand-icon">
              C<span className="brand-dot">✳</span>
            </span>
            <span className="brand-full-name">
              CINEVERSE<span className="brand-ai-badge">AI</span>
            </span>
          </Link>
          <button
            type="button"
            className="sidebar-mobile-close-btn"
            onClick={() => {
              sound.playClick(450);
              setMenuOpen(false);
            }}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* 🔍 In-Sidebar Movie Search Feature */}
        <div className="sidebar-search-container">
          <button
            type="button"
            className="sidebar-search-bar"
            onClick={() => {
              sound.playClick(520);
              setSearchOpen(true);
            }}
            title="Search 9,700+ movies, actors, directors, genres (⌘K)"
            aria-label="Search movies"
          >
            <Search size={15} className="text-lime" />
            <span className="sidebar-search-text">Search movies...</span>
            <kbd className="sidebar-search-kbd">⌘K</kbd>
          </button>
        </div>

        {/* Scrollable Nav Item List */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          {[
            { name: "Discover", label: "Discover", icon: Compass },
            { name: "Swipe mode", label: "Swipe Mode", icon: Flame },
            { name: "Tonight mode", label: "Tonight Studio", icon: Film },
            { name: "Taste lab", label: "Taste Lab", icon: FlaskConical },
            { name: "Watchlist", label: "Watchlist", icon: Bookmark, count: entries.filter((e) => e.watchlist).length },
            { name: "Favorites", label: "Favorites", icon: Heart, count: entries.filter((e) => e.favorite).length },
            { name: "Watch journal", label: "Watch Journal", icon: CheckCircle2, count: entries.filter((e) => e.watched).length },
            { name: "Not for me", label: "Not For Me", icon: EyeOff },
            { name: "Group night", label: "Group Night", icon: Users },
            { name: "Galaxy", label: "Galaxy 3D", icon: Orbit },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.name;
            return (
              <button
                key={item.name}
                type="button"
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  sound.playClick(620);
                  setMenuOpen(false);
                  navigate(item.name);
                }}
                title={item.label}
                aria-label={item.label}
              >
                <span className="nav-icon-wrap">
                  <Icon size={20} />
                </span>
                <span className="nav-item-label">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="nav-item-badge">{item.count}</span>
                )}
                {isActive && <span className="nav-active-pill" />}
              </button>
            );
          })}

          {/* Integrated Universes Link */}
          <Link
            href="/categories"
            className="sidebar-nav-item"
            onClick={() => sound.playClick(620)}
            title="Universes (Categories)"
            aria-label="Universes"
          >
            <span className="nav-icon-wrap">
              <Globe size={20} />
            </span>
            <span className="nav-item-label">Universes</span>
            <ArrowUpRight size={13} className="nav-external-arrow" />
          </Link>
        </nav>

        {/* Bottom Section: Sound FX Toggle + Profile / Account */}
        <div className="sidebar-footer">
          {/* Audio FX Toggle */}
          <button
            type="button"
            className={`sidebar-nav-item audio-toggle-btn ${soundOn ? "sound-active" : ""}`}
            onClick={toggleSound}
            title={soundOn ? "Mute interactive audio effects" : "Enable interactive audio"}
            aria-label={soundOn ? "Mute sound effects" : "Enable sound effects"}
          >
            <span className="nav-icon-wrap">
              {soundOn ? <Volume2 size={19} className="text-lime" /> : <VolumeX size={19} />}
            </span>
            <span className="nav-item-label">
              {soundOn ? "Audio FX: On" : "Audio: Muted"}
            </span>
            {soundOn && <span className="nav-live-dot" />}
          </button>

          {/* User Account / Profile with Framer Motion Options Menu */}
          <div className="sidebar-account-container" style={{ position: "relative" }}>
            <button
              type="button"
              className="sidebar-user-card"
              onClick={() => {
                sound.playClick(650);
                setAccountMenuOpen((prev) => !prev);
              }}
              title={accountName ? `Account: ${accountName}` : "Account & Profile Options"}
              aria-label="Account Options"
            >
              <div className={`sidebar-avatar ${accountName ? "" : "guest"}`}>
                {accountName ? accountName.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <div className="sidebar-user-info">
                <span className="user-name">{accountName || "Cinema Explorer"}</span>
                <span className="user-role">Account & Settings</span>
              </div>
              <ChevronUp
                size={16}
                style={{
                  color: "#94a3b8",
                  marginLeft: "auto",
                  transform: accountMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {/* Framer Motion Account Menu Popover */}
            <AnimatePresence>
              {accountMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.16 }}
                  className="sidebar-account-popover"
                >
                  <div className="account-popover-header">
                    <strong>{accountName || "Cinema Explorer"}</strong>
                    <span className="account-popover-sub">Taste Profile & DNA</span>
                  </div>

                  <div className="account-popover-divider" />

                  <Link
                    href="/profile"
                    className="account-popover-item"
                    onClick={() => {
                      sound.playClick(620);
                      setAccountMenuOpen(false);
                    }}
                  >
                    <Edit3 size={15} className="text-lime" />
                    <span>Edit Profile</span>
                  </Link>

                  <button
                    type="button"
                    className="account-popover-item"
                    onClick={() => {
                      sound.playClick(620);
                      setAccountMenuOpen(false);
                      setProfileOpen(true);
                    }}
                  >
                    <Fingerprint size={15} style={{ color: "var(--gold)" }} />
                    <span>Taste DNA Profile</span>
                  </button>

                  <a
                    href="/api/me/export"
                    download="cineverse-cinema-data.json"
                    className="account-popover-item"
                    onClick={() => {
                      sound.playClick(620);
                      setAccountMenuOpen(false);
                    }}
                  >
                    <Download size={15} style={{ color: "#38bdf8" }} />
                    <span>Export Cinema Data</span>
                  </a>

                  <div className="account-popover-divider" />

                  <button
                    type="button"
                    className="account-popover-item logout-item"
                    onClick={async () => {
                      sound.playClick(450);
                      setAccountMenuOpen(false);
                      try {
                        localStorage.removeItem("cineverse-demo");
                        if (supabase) await supabase.auth.signOut();
                      } catch {}
                      setAccountName("");
                      setNotice("Signed out of session. Guest mode active.");
                      setTimeout(() => {
                        window.location.reload();
                      }, 400);
                    }}
                  >
                    <LogOut size={15} className="text-rose" />
                    <span style={{ color: "#f87171" }}>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
      {menuOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setMenuOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu backdrop"
        />
      )}
      <div className="workspace">
        {/* Responsive Mobile Topbar (Prevents any overlap on mobile/tablet) */}
        <header className="mobile-discover-topbar">
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={() => {
              sound.playClick(520);
              setMenuOpen(true);
            }}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <Link
            href="/"
            className="mobile-topbar-brand"
            onClick={() => sound.playClick(440)}
          >
            <span className="mobile-brand-icon">
              C<span style={{ color: "var(--gold)" }}>✳</span>
            </span>
            <span className="mobile-brand-name">
              CINEVERSE<span className="mobile-ai-badge">AI</span>
            </span>
          </Link>

          <div className="mobile-topbar-actions">
            <button
              type="button"
              className="mobile-topbar-icon-btn"
              onClick={() => {
                sound.playClick(520);
                setSearchOpen(true);
              }}
              title="Search movies"
              aria-label="Search movies"
            >
              <Search size={17} />
            </button>
            <button
              type="button"
              className="mobile-topbar-icon-btn"
              onClick={() => {
                sound.playClick(620);
                setProfileOpen(true);
              }}
              title="Your Profile"
              aria-label="Your Profile"
            >
              <User size={17} />
            </button>
          </div>
        </header>
        <main>
          {/* Top In-App Text & Context Header (Implemented naturally inside the app, not a floating navbar) */}
          <div className="in-app-text-top-header">
            <div className="in-app-title-group">
              <span className="in-app-context-eyebrow">
                <span className="live-dot" /> CINEVERSE NEURAL ENGINE · {tab.toUpperCase()}
              </span>
              <h1 className="in-app-main-title">
                {tab === "Discover" && "Discover Cinema"}
                {tab === "Tonight mode" && "Tonight Studio"}
                {tab === "Swipe mode" && "Swipe Match Mode"}
                {tab === "Taste lab" && "Taste Fusion Lab"}
                {tab === "Watchlist" && "Your Watchlist"}
                {tab === "Favorites" && "Your Favorites"}
                {tab === "Watch journal" && "Watch Journal"}
                {tab === "Not for me" && "Dismissed Films"}
                {tab === "Group night" && "Group Night Consensus"}
                {tab === "Galaxy" && "3D Movie Galaxy"}
              </h1>
              <p className="in-app-subtitle">
                {tab === "Discover" && "Explore 9,742 movies curated by mood, taste, and neural synergy."}
                {tab === "Tonight mode" && "Quick decisions. Select your mood, time window, and company for your ultimate pick."}
                {tab === "Swipe mode" && "Fast-paced movie matching. Like, pass, or bookmark films in seconds."}
                {tab === "Taste lab" && "Blend 2–3 films together to synthesize custom neural recommendations."}
                {tab === "Watchlist" && "Your saved films ready to stream anytime."}
                {tab === "Favorites" && "Masterpieces you cherish and rate highly."}
                {tab === "Watch journal" && "Your personal cinema timeline and watched status."}
                {tab === "Not for me" && "Excluded films hidden from your recommendations."}
                {tab === "Group night" && "Consensus recommendations for 2 to 8 people without fighting."}
                {tab === "Galaxy" && "Explore 9,742 movies plotted in interactive 3D embedding space."}
              </p>
            </div>

            <div className="in-app-header-controls">
              {/* Show Profile */}
              <button
                type="button"
                className="topbar-chip-btn profile-btn"
                onClick={() => {
                  sound.playClick(620);
                  setProfileOpen(true);
                }}
                title="Show Cinephile Profile & Taste DNA"
              >
                <User size={13} className="text-gold" />
                <span>Profile</span>
              </button>

              {/* Surprise Me Serendipity Button */}
              <button
                type="button"
                className="topbar-chip-btn surprise-btn"
                onClick={() => triggerSurpriseMe()}
                title="Serendipity pick outside your recommendation bubble"
              >
                <Sparkles size={12} />
                <span>Surprise Pick</span>
              </button>
            </div>
          </div>
          {tab === "Discover" && (
            <>
              {/* Minimalist Dashboard Banner */}
              <section className="dashboard-minimal-banner">
                <div className="dashboard-greeting-minimal">
                  <div className="eyebrow" style={{ color: "var(--gold)", marginBottom: "4px" }}>
                    NEURAL TASTE DISCOVERY
                  </div>
                  <h1>{getDynamicGreeting()}</h1>
                </div>


                {/* 8-State Research-Grounded Mood Recommender */}
                <div className="moods-research-container">
                  <div className="moods-title-row">
                    <h3>
                      <span>🎬</span> What should we watch tonight?
                    </h3>
                    <span>Instant mood synesthesia + taste history</span>
                  </div>
                  <div className="moods-pills-grid">
                    {RESEARCH_MOODS.map((rm, i) => {
                      const isActive = mood === rm.id;
                      return (
                        <button
                          key={rm.id}
                          type="button"
                          className={`mood-pill-btn ${isActive ? "active" : ""}`}
                          onClick={() => {
                            sound.playClick(580 + i * 35);
                            const nextMood = isActive ? "" : rm.id;
                            setMood(nextMood);
                            if (nextMood) {
                              setNotice(`${rm.emoji} Selected ${rm.label}: ${rm.desc}`);
                              load("discover", 0, undefined, { mood: nextMood });
                            } else {
                              load("discover", 0, undefined, { mood: "" });
                            }
                          }}
                          title={rm.desc}
                        >
                          <span className="emoji">{rm.emoji}</span>
                          <span>{rm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search Bar */}
                <form
                  className="search"
                  style={{ marginTop: "18px" }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    sound.playClick(650);
                    load();
                  }}
                >
                  <Sparkles size={20} />
                  <input
                    aria-label="Describe your movie mood"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by plot theme, auteur, aesthetic mood (e.g. 'existential space paradox')..."
                  />
                  <button aria-label="Find movies">
                    <ArrowRight size={21} />
                  </button>
                </form>

                {/* 🧬 Signature Feature: YOUR MOVIE DNA & 2026 STATS */}
                <div className="dna-dashboard-card">
                  <div className="dna-card-left">
                    <h3>
                      <span>🧬 YOUR MOVIE DNA</span>
                      <button
                        type="button"
                        className="quick-chip-btn"
                        style={{ fontSize: "11px", padding: "4px 10px" }}
                        onClick={() => setShowDnaEvolution(!showDnaEvolution)}
                      >
                        {showDnaEvolution ? "View DNA Vectors" : "📈 Taste Evolution"}
                      </button>
                    </h3>

                    {showDnaEvolution ? (
                      <div className="evolution-timeline">
                        <div className="evolution-step">
                          <span className="evolution-year">2024</span>
                          <span className="evolution-desc">Action / Blockbuster / High-Concept Comedy (38% focus)</span>
                        </div>
                        <div className="evolution-step">
                          <span className="evolution-year">2025</span>
                          <span className="evolution-desc">Sci-Fi / Cyberpunk / Gritty Neo-Noir Thriller (44% focus)</span>
                        </div>
                        <div className="evolution-step" style={{ borderColor: "rgba(206, 247, 160, 0.4)", background: "rgba(206, 247, 160, 0.05)" }}>
                          <span className="evolution-year" style={{ color: "var(--green)" }}>2026</span>
                          <span className="evolution-desc"><strong>Psychological Mystery / Existential Cinema (52% focus)</strong></span>
                        </div>
                        <small style={{ color: "var(--muted)", marginTop: "6px" }}>
                          ✦ Models how user interest dynamically evolves over time (Springer 2026).
                        </small>
                      </div>
                    ) : (
                      <div className="dna-bars-stack">
                        {[
                          { label: "Sci-Fi", val: userProfile?.genres["Sci-Fi"] || 34, color: "" },
                          { label: "Thriller", val: userProfile?.genres["Thriller"] || 28, color: "purple" },
                          { label: "Mystery", val: userProfile?.genres["Mystery"] || 18, color: "" },
                          { label: "Drama", val: userProfile?.genres["Drama"] || 14, color: "gold" },
                          { label: "Action", val: userProfile?.genres["Action"] || 10, color: "" },
                          { label: "Other", val: userProfile?.genres["Other"] || 6, color: "purple" },
                        ].map((b) => (
                          <div key={b.label} className="dna-bar-item">
                            <span className="dna-bar-label">{b.label}</span>
                            <div className="dna-bar-track">
                              <div
                                className={`dna-bar-fill ${b.color}`}
                                style={{ width: `${Math.min(100, b.val * 2.2)}%` }}
                              />
                            </div>
                            <span className="dna-bar-val">{b.val}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="dna-meta-tags">
                      <span className="dna-meta-tag">🎬 Nolan, Villeneuve, Miyazaki</span>
                      <span className="dna-meta-tag">⭐ DiCaprio, McConaughey, Chalamet</span>
                      <span className="dna-meta-tag">⏳ 132 min avg</span>
                      <span className="dna-meta-tag">🗣 English / Japanese</span>
                    </div>
                  </div>

                  <div className="dna-card-right">
                    <h3>
                      <span>📊 YOUR 2026 MOVIE STATS</span>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>ANNUAL INSIGHTS</span>
                    </h3>

                    <div className="dna-stats-strip">
                      <div className="dna-stat-col">
                        <strong>{userProfile?.stats2026?.moviesWatched || 47}</strong>
                        <span>movies</span>
                      </div>
                      <div className="dna-stat-col">
                        <strong>{userProfile?.stats2026?.hoursWatched || 91}h</strong>
                        <span>hours</span>
                      </div>
                      <div className="dna-stat-col">
                        <strong>{userProfile?.stats2026?.genresExplored || 14}</strong>
                        <span>genres</span>
                      </div>
                    </div>

                    <div style={{ marginTop: "14px", fontSize: "12px", color: "#a5b0aa", lineHeight: "1.5" }}>
                      <strong style={{ display: "block", color: "var(--text)", marginBottom: "4px" }}>
                        🎯 Preferred Movie Themes:
                      </strong>
                      Deep Space Odysseys, Time Dilations, Neo-Noir Reality Distortions, and High-Concept Philosophical Thrillers.
                    </div>
                  </div>
                </div>
              </section>


            </>
          )}

          {/* 🎬 MOVIE TINDER / SWIPE DISCOVERY MODE */}
          {tab === "Swipe mode" && (
            <section className="swipe-mode-container">
              <div className="eyebrow" style={{ color: "var(--green)" }}>
                DISCOVERY TINDER · VECTOR RECALIBRATION
              </div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "6px 0 10px" }}>
                Movie Tinder <em>Swipe Discovery</em>
              </h1>
              <p style={{ color: "var(--muted)", maxWidth: "480px", margin: "0 auto 16px" }}>
                Swipe ❤️ to save, ❌ to pass, ⭐ for must-watch. Every swipe updates your Taste DNA in real-time.
              </p>

              {/* Feed Controls: Refresh & Infinite Expansion */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={refreshSwipeFeed}
                  title="Refresh entire deck with fresh movies"
                >
                  <Shuffle size={13} />
                  <span>Refresh Feed & Shuffle</span>
                </button>
                <button
                  type="button"
                  className="quick-chip-btn"
                  onClick={appendMoreToSwipeDeck}
                  title="Load 30 additional movies to your deck"
                >
                  <Plus size={13} />
                  <span>Add 30 More Movies</span>
                </button>
                {swipeDeck.length > 0 && (
                  <span style={{ fontSize: "11px", color: "var(--muted)", padding: "4px 8px", background: "rgba(255,255,255,0.04)", borderRadius: "8px" }}>
                    Stack: {swipeDeck.length - swipeIndex} remaining ({swipeDeck.length} total)
                  </span>
                )}
              </div>

              {swipeFeedback && (
                <div
                  style={{
                    background: "rgba(206, 247, 160, 0.12)",
                    border: "1px solid var(--green)",
                    color: "var(--green)",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    display: "inline-block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "16px",
                  }}
                >
                  {swipeFeedback}
                </div>
              )}

              {swipeDeck.length > 0 && swipeIndex < swipeDeck.length ? (
                (() => {
                  const m = swipeDeck[swipeIndex];
                  return (
                    <div className="swipe-card-viewport">
                      <div className="swipe-cinema-card">
                        <div className="swipe-poster-wrap">
                          <Image
                            src={m.poster ? `https://image.tmdb.org/t/p/w780${m.poster}` : "/poster.svg"}
                            alt={m.title}
                            fill
                            unoptimized
                            style={{ objectFit: "cover" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: 14,
                              left: 14,
                              background: "rgba(0,0,0,0.85)",
                              border: "1px solid rgba(206, 247, 160, 0.4)",
                              borderRadius: "10px",
                              padding: "4px 10px",
                              fontSize: "12px",
                              fontWeight: 800,
                              color: "var(--green)",
                            }}
                          >
                            ⚡ {m.match ? `${Math.round(m.match)}% Match` : "96% Match"}
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              top: 14,
                              right: 14,
                              background: "rgba(0,0,0,0.85)",
                              borderRadius: "10px",
                              padding: "4px 10px",
                              fontSize: "12px",
                              color: "#fbbf24",
                              fontWeight: 700,
                            }}
                          >
                            ★ {m.score.toFixed(1)}/5
                          </div>
                        </div>

                        <div className="swipe-card-body">
                          <div>
                            <h2>{m.title} ({m.year})</h2>
                            <p style={{ color: "var(--muted)", fontSize: "12px", margin: "2px 0 10px" }}>
                              {m.genres.join(" · ")} {m.runtime ? `· ${m.runtime} min` : ""}
                            </p>
                            <p style={{ fontSize: "13px", color: "#c6d1cb", lineHeight: "1.5" }}>
                              {m.overview ? (m.overview.length > 180 ? m.overview.slice(0, 180) + "..." : m.overview) : "A masterwork waiting to be discovered."}
                            </p>
                          </div>

                          <div style={{ marginTop: "12px" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {m.dna && Object.entries(m.dna).slice(0, 4).map(([k, v]) => (
                                <span
                                  key={k}
                                  style={{
                                    fontSize: "11px",
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    padding: "3px 8px",
                                    borderRadius: "8px",
                                    color: "#a4b0a8",
                                  }}
                                >
                                  {k}: {typeof v === "number" && v <= 1 ? Math.round(v * 100) : v}%
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="swipe-controls-bar">
                        <button
                          type="button"
                          className="swipe-btn dislike"
                          onClick={() => handleSwipe("dislike")}
                          title="Pass / Dislike (Lower weight)"
                          aria-label="Pass"
                        >
                          <X size={28} />
                        </button>
                        <button
                          type="button"
                          className="swipe-btn watch"
                          style={{
                            background: "rgba(245, 197, 24, 0.16)",
                            borderColor: "rgba(245, 197, 24, 0.4)",
                            color: "var(--gold)",
                          }}
                          onClick={() => {
                            sound.playChime();
                            setWatchMovie(m);
                          }}
                          title="Watch Official YouTube Trailer"
                          aria-label="Watch Trailer"
                        >
                          <Play size={24} fill="currentColor" />
                        </button>
                        <button
                          type="button"
                          className="swipe-btn star"
                          onClick={() => handleSwipe("star")}
                          title="Must Watch! (5-Star + Strong boost)"
                          aria-label="Must Watch"
                        >
                          <Star size={28} />
                        </button>
                        <button
                          type="button"
                          className="swipe-btn like"
                          onClick={() => handleSwipe("like")}
                          title="Interested / Save to Watchlist"
                          aria-label="Interested"
                        >
                          <Heart size={28} />
                        </button>
                      </div>

                      <div style={{ marginTop: "16px", color: "var(--muted)", fontSize: "12px" }}>
                        Card {swipeIndex + 1} of {swipeDeck.length} · Swipe buttons active
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{ padding: "60px 20px" }}>
                  <h3>You've explored the current swipe stack!</h3>
                  <p style={{ color: "var(--muted)", margin: "10px 0 20px" }}>
                    Your Taste DNA has been recalibrated with all your swipe choices.
                  </p>
                  <button
                    type="button"
                    className="primary"
                    onClick={() => load("swipe", 0, undefined, { novelty: 0.45 })}
                  >
                    Load Fresh 25 Cards
                  </button>
                </div>
              )}
            </section>
          )}

          {/* 🌙 TONIGHT MODE STUDIO */}
          {tab === "Tonight mode" && (
            <section className="tonight-card-builder">
              <div className="eyebrow" style={{ color: "var(--green)" }}>QUICK DECISION STUDIO</div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, margin: "6px 0 10px" }}>
                “What should I watch tonight?”
              </h1>
              <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
                Answer 4 quick questions. Our hybrid context engine generates your instant tailored pick.
              </p>

              <div className="tonight-question-row">
                <label>1. What is your mood tonight?</label>
                <div className="tonight-choice-group">
                  {RESEARCH_MOODS.map((rm) => (
                    <button
                      key={rm.id}
                      type="button"
                      className={`tonight-choice-btn ${tonightMood === rm.id ? "active" : ""}`}
                      onClick={() => {
                        sound.playClick(600);
                        setTonightMood(rm.id);
                      }}
                    >
                      {rm.emoji} {rm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tonight-question-row">
                <label>2. Available time window?</label>
                <div className="tonight-choice-group">
                  {[
                    { id: "90", label: "⚡ Quick (< 90 mins)" },
                    { id: "120", label: "🎬 Standard (< 2 hours)" },
                    { id: "180", label: "🍿 Epic (2+ hours)" },
                    { id: "all", label: "✨ Any runtime" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`tonight-choice-btn ${tonightTime === t.id ? "active" : ""}`}
                      onClick={() => {
                        sound.playClick(620);
                        setTonightTime(t.id);
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tonight-question-row">
                <label>3. Who are you watching with?</label>
                <div className="tonight-choice-group">
                  {[
                    { id: "solo", label: "👤 Solo contemplation" },
                    { id: "couple", label: "💑 Date Night / Couple" },
                    { id: "friends", label: "🍿 Friends / Movie night" },
                    { id: "family", label: "👨‍👩‍👧 Family friendly" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`tonight-choice-btn ${tonightCompany === c.id ? "active" : ""}`}
                      onClick={() => {
                        sound.playClick(640);
                        setTonightCompany(c.id);
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "28px" }}>
                <button
                  type="button"
                  className="primary"
                  style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: 800 }}
                  onClick={() => generateTonightFilm()}
                >
                  <Sparkles size={18} /> Generate Tonight's Recommendation 🍿
                </button>
              </div>

              {tonightResult && (
                <div style={{ marginTop: "32px", borderTop: "1px solid var(--line)", paddingTop: "24px" }}>
                  <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ position: "relative", width: "160px", height: "240px", borderRadius: "14px", overflow: "hidden" }}>
                      <Image
                        src={tonightResult.poster ? `https://image.tmdb.org/t/p/w500${tonightResult.poster}` : "/poster.svg"}
                        alt={tonightResult.title}
                        fill
                        unoptimized
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: "260px" }}>
                      <span className="dashboard-badge-active">
                        🏆 97% TONIGHT'S CHAMPION
                      </span>
                      <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "8px 0 4px" }}>
                        {tonightResult.title} ({tonightResult.year})
                      </h2>
                      <p style={{ color: "var(--muted)", fontSize: "12px", margin: "0 0 10px" }}>
                        {tonightResult.genres.join(" · ")} {tonightResult.runtime ? `· ${tonightResult.runtime} min` : ""}
                      </p>
                      <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#d2ddd6" }}>
                        {tonightResult.overview || "An exceptional story curated precisely for your mood and company tonight."}
                      </p>
                      <div className="modal-why-box" style={{ margin: "12px 0" }}>
                        <strong>✦ WHY THIS WORKS TONIGHT</strong>
                        <p>{tonightResult.why || `Calibrated for ${tonightMood} mood with ${tonightCompany} dynamic.`}</p>
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="primary"
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #f5c518 0%, #eab308 100%)", color: "#080c14", fontWeight: 700 }}
                          onClick={() => setWatchMovie(tonightResult)}
                        >
                          <Play size={15} fill="currentColor" /> Watch Trailer
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelected(tonightResult)}
                        >
                          Full Details & Cast
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick(680);
                            save(tonightResult, { watchlist: true });
                            setNotice(`Saved "${tonightResult.title}" to Watchlist!`);
                          }}
                        >
                          <Bookmark size={15} /> Save to Watchlist
                        </button>
                      </div>
                    </div>
                  </div>

                  {tonightAlternates.length > 0 && (
                    <div style={{ marginTop: "24px" }}>
                      <h4 style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "12px" }}>
                        OR IF YOU WANT A SLIGHTLY DIFFERENT TWIST:
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                        {tonightAlternates.map((alt) => (
                          <div
                            key={alt.id}
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "10px",
                              padding: "10px 14px",
                              cursor: "pointer",
                            }}
                            onClick={() => setSelected(alt)}
                          >
                            <div style={{ fontWeight: 700, fontSize: "13px" }}>{alt.title} ({alt.year})</div>
                            <div style={{ color: "var(--muted)", fontSize: "11px" }}>★ {alt.score.toFixed(1)} · {alt.genres.slice(0, 2).join(", ")}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
          {tab === "Taste lab" && (
            <section className="lab neural-lab-studio">
              <div className="eyebrow">YOUR TASTE, UNDER THE MICROSCOPE</div>
              <div className="lab-header-flex">
                <div>
                  <h1>
                    Neural Taste <em>Modeling Studio</em>
                  </h1>
                  <p>
                    Shape 64-dimensional vector DNA, test instant mood synesthesia, inspect algorithmic bias, and fuse cinematic genomes.
                  </p>
                </div>
                <div className="lab-stats-badge">
                  <span className="live-dot" />
                  <span>9,742 FILMS EMBEDDED IN TASTE GRAPH</span>
                </div>
              </div>

              {/* In-App Interactive Stepper / Module Switcher */}
              <div className="how-modal-tabs in-app-lab-tabs">
                {LAB_STEPS.map((step, idx) => {
                  const active = labStep === step.id;
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={`how-tab-btn ${active ? "active" : ""}`}
                      onClick={() => {
                        sound.playClick(520 + idx * 50);
                        setLabStep(step.id);
                      }}
                    >
                      <span className="how-tab-num">{step.number}</span>
                      <Icon size={15} />
                      <span>{step.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Module Content Container */}
              <div className="in-app-lab-body">
                {/* 01: Vector Taste DNA */}
                {labStep === "dna" && (
                  <div className="lab-submodule-panel">
                    <div className="how-step-info">
                      <span className="how-step-tag">NEURAL MODELING</span>
                      <h3>Vector Taste DNA Engine</h3>
                      <p>
                        Every film is mapped across 64 multi-dimensional vectors—measuring atmosphere, visual texture, emotional complexity, and thematic depth.
                      </p>
                    </div>

                    <div className="how-interactive-sandbox in-app-sandbox">
                      <div className="sandbox-header">
                        <Sliders size={14} />
                        <span>INTERACTIVE VECTOR CONTROLS:</span>
                      </div>

                      <div className="sandbox-controls">
                        <div className="sandbox-slider-row">
                          <div className="slider-label">
                            <span>Atmosphere Depth</span>
                            <span className="slider-val">{atmosphereVal}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={atmosphereVal}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setAtmosphereVal(val);
                              sound.playClick(580 + val, 0.015);
                            }}
                            className="sandbox-range"
                          />
                          <div className="slider-hints">
                            <span>Grounded Realism</span>
                            <span>Cosmic / Surreal</span>
                          </div>
                        </div>

                        <div className="sandbox-slider-row">
                          <div className="slider-label">
                            <span>Pacing Index</span>
                            <span className="slider-val">{pacingVal}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={pacingVal}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setPacingVal(val);
                              sound.playClick(600 + val, 0.015);
                            }}
                            className="sandbox-range"
                          />
                          <div className="slider-hints">
                            <span>Contemplative Slow Burn</span>
                            <span>High Octane Kinetic</span>
                          </div>
                        </div>

                        <div className="sandbox-results-badge">
                          <span className="res-tag">SIMULATED MATCHES:</span>
                          <span className="res-films">
                            {atmosphereVal > 60 && pacingVal < 50
                              ? "Interstellar (99.4%) · 2001: A Space Odyssey (98.1%) · Solaris (97.5%)"
                              : atmosphereVal > 60 && pacingVal >= 50
                              ? "Blade Runner 2049 (99.2%) · The Matrix (98.6%) · Inception (98.0%)"
                              : atmosphereVal <= 60 && pacingVal < 50
                              ? "No Country for Old Men (98.8%) · Taxi Driver (97.9%) · Drive (97.2%)"
                              : "Mad Max: Fury Road (99.5%) · Heat (98.7%) · John Wick (98.1%)"}
                          </span>
                        </div>

                        <div className="sandbox-actions-row">
                          <button
                            type="button"
                            className="primary in-app-apply-btn"
                            onClick={() => {
                              applyDnaToCatalog();
                            }}
                          >
                            <Sparkles size={15} /> Apply DNA to Catalog Feed
                          </button>
                          <button
                            type="button"
                            className="quiet"
                            onClick={() => {
                              sound.playClick(440);
                              setAtmosphereVal(70);
                              setPacingVal(45);
                              setNotice("DNA sliders reset to default parameters.");
                            }}
                          >
                            <RotateCcw size={14} /> Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 02: Instant Mood Synesthesia */}
                {labStep === "mood" && (
                  <div className="lab-submodule-panel">
                    <div className="how-step-info">
                      <span className="how-step-tag">DYNAMIC ROTATION</span>
                      <h3>Instant Mood Synesthesia</h3>
                      <p>
                        Tired of generic categories? Select your current psychological state. Our recommendation matrix instantly shifts weights to match your exact vibe.
                      </p>
                    </div>

                    <div className="how-interactive-sandbox in-app-sandbox">
                      <div className="sandbox-header">
                        <Zap size={14} />
                        <span>SELECT FREQUENCY TO SYNTHESIZE:</span>
                      </div>

                      <div className="sandbox-mood-controls">
                        <div className="sandbox-pills-row">
                          {LAB_MOODS.map((m, i) => (
                            <button
                              key={m.label}
                              type="button"
                              className={`sandbox-mood-btn ${selectedLabMood === i ? "active" : ""}`}
                              onClick={() => {
                                setSelectedLabMood(i);
                                sound.playClick(620 + i * 25, 0.03);
                              }}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>

                        <div className="sandbox-results-badge">
                          <span className="res-tag">INSTANT MOOD SYNC:</span>
                          <span className="res-films">
                            {LAB_MOODS[selectedLabMood].match}
                          </span>
                        </div>

                        <div className="sandbox-actions-row">
                          <button
                            type="button"
                            className="primary in-app-apply-btn"
                            onClick={() => {
                              applyMoodToCatalog(LAB_MOODS[selectedLabMood]);
                            }}
                          >
                            <Zap size={15} /> Tune Catalog to this Mood
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 03: Zero Algorithmic Traps & True Taste Profiler */}
                {labStep === "curation" && (
                  <div className="lab-submodule-panel">
                    <div className="how-step-info">
                      <span className="how-step-tag">HUMAN-FIRST CURATION</span>
                      <h3>Zero Algorithmic Traps</h3>
                      <p>
                        No corporate studio sponsorships. No infinite social media doom loops. Only cinema crafted for genuine emotional resonance and authentic discovery.
                      </p>
                    </div>

                    <div className="how-interactive-sandbox in-app-sandbox">
                      <div className="sandbox-header">
                        <Compass size={14} />
                        <span>TRANSPARENT MATCH REASON INSPECTOR:</span>
                      </div>

                      <div className="sandbox-curation-preview">
                        <div className="sample-card-preview in-app-sample-card">
                          <div className="sample-poster-box">
                            <Film size={26} className="text-lime" />
                          </div>
                          <div className="sample-card-details">
                            <h4>Spirited Away (千と千尋の神隠し)</h4>
                            <div className="sample-card-meta">
                              <span className="meta-star"><Star size={11} fill="currentColor" /> 8.6</span>
                              <span>Animation · Fantasy</span>
                              <span>2001</span>
                            </div>
                            <p className="sample-card-reason">
                              ✦ 99.7% Match Reason: Matches your affinity for hand-drawn atmospheric surrealism and emotional coming-of-age narratives.
                            </p>
                          </div>
                        </div>

                        <div className="profiler-presets-section">
                          <div className="profiler-title">
                            <Sparkle size={14} className="text-lime" />
                            <span>1-CLICK PERSONAL TASTE PROFILER (CALIBRATE YOUR VIBE):</span>
                          </div>
                          <p className="profiler-subtext">
                            Select an archetype below to calibrate your vector DNA profile instantly without tedious manual entry:
                          </p>
                          <div className="archetype-grid">
                            {TASTE_ARCHETYPES.map((arch) => (
                              <button
                                key={arch.name}
                                type="button"
                                className="archetype-card-btn"
                                onClick={() => {
                                  calibrateArchetype(arch);
                                }}
                              >
                                <span className="arch-icon">{arch.icon}</span>
                                <div>
                                  <strong>{arch.name}</strong>
                                  <small>{arch.sample}</small>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 04: Movie DNA Fusion Reactor */}
                {labStep === "fusion" && (
                  <div className="lab-submodule-panel">
                    <div className="how-step-info">
                      <span className="how-step-tag">HYBRID SYNTHESIS</span>
                      <h3>Movie DNA Fusion Reactor</h3>
                      <p>
                        Combine the cinematic genomes of two or three masterpieces to discover rare crossover films bridging their styles.
                      </p>
                    </div>

                    <div className="how-interactive-sandbox in-app-sandbox">
                      <div className="sandbox-header">
                        <FlaskConical size={14} />
                        <span>FUSION CHAMBER BENCH ({fusionMovies.length} / 3 MOVIES LOADED):</span>
                      </div>

                      <div className="fusion-bench-grid">
                        {[0, 1, 2].map((slotIdx) => {
                          const movieObj = fusionMovies[slotIdx];
                          const searchVal = fusionSlotSearch[slotIdx] || "";
                          const searchResults = fusionSlotResults[slotIdx] || [];
                          return (
                            <div key={slotIdx} className={`fusion-slot ${movieObj ? "filled" : "empty"}`} style={{ position: "relative" }}>
                              <span className="slot-num">SLOT {slotIdx + 1}</span>
                              {movieObj ? (
                                <div className="slot-content">
                                  <strong>{movieObj.title}</strong>
                                  <span>{movieObj.year} · {movieObj.genres.slice(0, 2).join("/")}</span>
                                  <button
                                    type="button"
                                    className="slot-remove-btn"
                                    onClick={() => removeMovieFromFusion(movieObj.id)}
                                  >
                                    <X size={13} /> Remove
                                  </button>
                                </div>
                              ) : (
                                <div className="slot-placeholder">
                                  <span>+ Empty Slot</span>
                                  <div className="slot-add-input-row">
                                    <input
                                      type="text"
                                      className="slot-quick-input"
                                      placeholder="Search film to load..."
                                      value={searchVal}
                                      onChange={(e) => searchMovieForSlot(slotIdx, e.target.value)}
                                    />
                                  </div>
                                  {searchResults.length > 0 && (
                                    <div className="slot-results-dropdown">
                                      {searchResults.map((m) => (
                                        <button
                                          key={m.id}
                                          type="button"
                                          className="slot-result-item"
                                          onClick={() => {
                                            addMovieToFusion(m);
                                            searchMovieForSlot(slotIdx, "");
                                          }}
                                        >
                                          <span>{m.title} ({m.year})</span>
                                          <Plus size={13} />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  <small style={{ marginTop: "4px", display: "block" }}>Pick from catalog or search above</small>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="sandbox-actions-row">
                        <button
                          type="button"
                          className="primary in-app-apply-btn"
                          disabled={fusionMovies.length < 2}
                          onClick={() => {
                            sound.playChime();
                            load("fusion", 0, undefined, { fusion: fusionMovies.map((m) => m.id) });
                          }}
                        >
                          <FlaskConical size={15} /> Fuse their DNA ({fusionMovies.length}/3)
                        </button>
                        <button
                          type="button"
                          className="quiet"
                          onClick={() => {
                            sound.playClick(420);
                            setFusionMovies([]);
                            setFusion([]);
                            setNotice("Fusion bench cleared.");
                          }}
                        >
                          Clear Bench
                        </button>
                      </div>

                      <div className="legendary-fusions-section">
                        <span className="res-tag">TRY LEGENDARY CINEMATIC PAIRINGS:</span>
                        <div className="pairings-grid">
                          {LEGENDARY_FUSIONS.map((pair) => (
                            <button
                              key={pair.tag}
                              type="button"
                              className="pairing-card-btn"
                              onClick={() => applyLegendaryFusion(pair)}
                            >
                              <div className="pairing-header">
                                <span className="pairing-tag">{pair.tag}</span>
                                <ArrowRight size={13} />
                              </div>
                              <strong>{pair.titles.join(" + ")}</strong>
                              <p>{pair.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DNA Diagnostics & Exploration Orbit */}
              <div className="lab-grid in-app-lab-aux">
                <div className="panel">
                  <h2>Your Active Taste DNA</h2>
                  {Object.keys(dna).length ? (
                    Object.entries(dna)
                      .slice(0, 8)
                      .map(([g, n]) => (
                        <div className="dna" key={g}>
                          <span>{g}</span>
                          <meter
                            min={0}
                            max={Math.max(...Object.values(dna))}
                            value={n}
                          />
                        </div>
                      ))
                  ) : (
                    <p>
                      Your DNA starts with a favorite. Open any movie below to favorite or rate it, or calibrate using the profiler above.
                    </p>
                  )}
                </div>

                <div className="panel">
                  <h2>Explore beyond your orbit</h2>
                  <p>Familiar favorites ← → Unexpected discoveries</p>
                  <input
                    aria-label="Novelty"
                    type="range"
                    min="0"
                    max="1"
                    step=".05"
                    value={novelty}
                    onChange={(e) => {
                      setNovelty(+e.target.value);
                      sound.playClick(500 + (+e.target.value * 200), 0.015);
                    }}
                  />
                  <button
                    className="primary"
                    onClick={() => {
                      sound.playChime();
                      load("discover");
                      setNotice("Remixed feed based on novelty slider!");
                    }}
                  >
                    Remix my recommendations
                  </button>
                </div>
              </div>
            </section>
          )}
          {tab === "Group night" && (
            <section className="lab neural-lab-studio">
              <div className="eyebrow">REAL-TIME COLLABORATIVE CO-WATCHING STUDIO</div>
              <div className="lab-header-flex">
                <div>
                  <h1>
                    Everyone’s <em>movie night.</em>
                  </h1>
                  <p>
                    Synced co-watching room. Choose taste seeds for each watcher or pick instant vibes. Our multi-vector consensus engine finds the film everyone will love.
                  </p>
                </div>
              </div>

              {/* Real-Time Synced Room Bar */}
              <div className="group-room-bar">
                <div className="room-badge-group">
                  <span className="room-code-tag">ROOM: {roomCode}</span>
                  <span className="live-sync-indicator">
                    <span className="pulse-dot" /> LIVE SESSION (SYNCED)
                  </span>
                  <span style={{ fontSize: "12px", color: "#8fa38c" }}>
                    · {groupPeople.length} Co-Watchers Connected
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="group-share-btn"
                    onClick={copyRoomLink}
                  >
                    <span>🔗 Copy Room Invite Link</span>
                  </button>
                  <button
                    type="button"
                    className="quiet"
                    style={{ padding: "6px 12px", fontSize: "11px" }}
                    onClick={() => {
                      const nextCode = `CINE-${Math.floor(1000 + Math.random() * 9000)}`;
                      setRoomCode(nextCode);
                      sound.playClick(620);
                      setNotice(`Generated new private co-watching room: ${nextCode}`);
                    }}
                  >
                    New Room
                  </button>
                </div>
              </div>

              {/* Co-Watchers Grid */}
              <div className="group-people-grid">
                {groupPeople.map((p, i) => {
                  const isActive = person === i;
                  const isEditing = editingPersonIdx === i;
                  return (
                    <div
                      key={p.id}
                      className={`group-person-card ${isActive ? "active" : ""}`}
                      onClick={() => {
                        if (person !== i) {
                          sound.playClick(500);
                          setPerson(i);
                        }
                      }}
                    >
                      <div className="person-card-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="person-avatar-badge">{p.avatar}</span>
                          {isEditing ? (
                            <input
                              type="text"
                              className="person-rename-input"
                              value={p.name}
                              autoFocus
                              onChange={(e) => updatePersonName(i, e.target.value)}
                              onBlur={() => setEditingPersonIdx(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingPersonIdx(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <button
                              type="button"
                              className="person-name-btn"
                              title="Click to rename"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPersonIdx(i);
                              }}
                            >
                              <span>{p.name}</span>
                              <span style={{ fontSize: "10px", opacity: 0.6 }}>✎</span>
                            </button>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {isActive && (
                            <span style={{ fontSize: "10px", fontWeight: 700, color: "#cef7a0", letterSpacing: "0.5px" }}>
                              ACTIVE
                            </span>
                          )}
                          {groupPeople.length > 2 && (
                            <button
                              type="button"
                              className="person-remove-btn"
                              title="Remove co-watcher"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePerson(i);
                              }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Selected Movie Tags */}
                      <div className="person-movies-list">
                        {p.movies.length > 0 ? (
                          p.movies.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              className="person-movie-tag"
                              title="Remove film"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMovieFromPerson(i, m.id);
                              }}
                            >
                              <span>{m.title}</span>
                              <X size={11} />
                            </button>
                          ))
                        ) : (
                          <div className="person-empty-hint">
                            Tap instant tastes below or search to add favorites
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Co-Watcher Button */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
                <button
                  type="button"
                  className="quiet"
                  disabled={groupPeople.length >= 8}
                  onClick={addPerson}
                >
                  <Plus size={14} /> Add Co-Watcher ({groupPeople.length}/8)
                </button>
                <span style={{ fontSize: "12px", color: "#7a8c78" }}>
                  Active watcher: <strong style={{ color: "#cef7a0" }}>{groupPeople[person]?.name || "Person"}</strong>
                </span>
              </div>

              {/* Quick Vibe Chips for Active Watcher */}
              <div className="group-quick-vibes">
                <div className="quick-vibes-title">
                  <Sparkle size={13} className="text-lime" />
                  <span>INSTANT TASTE SEEDS FOR {groupPeople[person]?.name.toUpperCase() || "WATCHER"}:</span>
                </div>
                <div className="quick-vibe-chips-row">
                  {GROUP_QUICK_SEEDS.map((seed) => (
                    <button
                      key={seed.label}
                      type="button"
                      className="quick-vibe-btn"
                      onClick={() => addQuickSeedToPerson(seed)}
                    >
                      {seed.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Movie Search for Active Watcher */}
              <form
                className="search group-search"
                onSubmit={async (e) => {
                  e.preventDefault();
                  sound.playClick(620);
                  try {
                    const d = await api(
                      "/movies?q=" + encodeURIComponent(groupQuery) + "&limit=6"
                    );
                    setGroupResults(d.items || []);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                <input
                  aria-label="Find a group favorite"
                  placeholder={`Search a favorite film to add for ${groupPeople[person]?.name || "active watcher"}…`}
                  value={groupQuery}
                  onChange={(e) => setGroupQuery(e.target.value)}
                />
                <button aria-label="Search group favorites">
                  <Search size={18} />
                </button>
              </form>

              {groupResults.length > 0 && (
                <div className="group-results">
                  {groupResults.map((m) => {
                    const alreadyAdded = groupPeople[person]?.movies.some((x) => x.id === m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => addMovieToActivePerson(m)}
                      >
                        {alreadyAdded ? "✓ Added" : `${m.title} (${m.year})`} {!alreadyAdded && <Plus size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Group Consensus Vibe Selector */}
              <div className="group-consensus-selector">
                <div className="consensus-title">
                  <SlidersHorizontal size={14} className="text-lime" />
                  <span>GROUP CONSENSUS ALGORITHM / TONIGHT’S VIBE:</span>
                </div>
                <div className="consensus-pills">
                  {GROUP_VIBES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`consensus-pill-btn ${groupVibe === v.id ? "active" : ""}`}
                      onClick={() => {
                        sound.playClick(580);
                        setGroupVibe(v.id);
                      }}
                    >
                      <div>{v.label}</div>
                      <small style={{ display: "block", opacity: 0.7, fontSize: "10.5px", marginTop: "2px" }}>
                        {v.desc}
                      </small>
                    </button>
                  ))}
                </div>
              </div>

              {/* Find Common Ground Button */}
              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="primary in-app-apply-btn"
                  style={{ padding: "14px 28px", fontSize: "14px" }}
                  disabled={groupPeople.some((p) => p.movies.length === 0)}
                  onClick={computeCommonGround}
                >
                  <Users size={16} /> Find Common Ground Shortlist ({groupPeople.length} Watchers)
                </button>
                {groupPeople.some((p) => p.movies.length === 0) && (
                  <p style={{ fontSize: "12px", color: "#8a9c88", marginTop: "8px" }}>
                    Tip: Add at least 1 favorite film for each person (use instant taste seeds or search) to unlock group consensus!
                  </p>
                )}
              </div>
            </section>
          )}
          {tab === "Admin" && (
            <section className="lab">
              <h1>Mission control.</h1>
              <div className="lab-grid">
                <div className="panel">
                  <h2>{stats?.movies?.toLocaleString() ?? "—"}</h2>
                  <p>Movies in your catalog</p>
                </div>
                <div className="panel">
                  <h2>{stats?.users?.toLocaleString() ?? "—"}</h2>
                  <p>People shaping their taste</p>
                </div>
                <div className="panel">
                  <h2>Discovery activity</h2>
                  {Object.entries(stats?.events ?? {}).map(([k, v]) => (
                    <p key={k}>
                      {k}: {String(v)}
                    </p>
                  ))}
                </div>
              </div>
              <button
                className="primary"
                onClick={async () => {
                  try {
                    await api("/admin/hydrate", {});
                    setNotice("Catalog hydration queued");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Refresh TMDB catalog
              </button>
            </section>
          )}
          {tab === "Galaxy" && (
            <section className="galaxy-ring-section" style={{ minHeight: "740px", position: "relative" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div className="eyebrow" style={{ color: "var(--gold)" }}>3D MOTION ROLODEX ENGINE</div>
                <h2 style={{ fontSize: "28px", fontWeight: 800, margin: "6px 0 8px" }}>
                  Your Cinematic Universe <em>Rolodex</em>
                </h2>
                <p style={{ color: "var(--muted)", maxWidth: "640px", margin: "0 auto", fontSize: "14px" }}>
                  22 films seated edge-out around a tipped wheel. Drag to throw with momentum physics, or click to inspect details and watch official trailers.
                </p>
              </div>
              <RolodexRing
                movies={items}
                onSelectMovie={(m) => setSelected(m as any)}
                onWatchMovie={(m) => setWatchMovie(m as any)}
              />
            </section>
          )}
          {error && (
            <div role="alert" className="error">
              {error}
              <button onClick={() => load("catalog")}>Retry</button>
            </div>
          )}
          {(notice || saving > 0) && (
            <div role="status" className="notice" onClick={() => setNotice("")}>
              {saving ? "Saving your taste…" : notice} <X size={14} />
            </div>
          )}
          {tab === "Discover" && (
            <>
            <form
              className="catalog-filters"
              onSubmit={(e) => {
                e.preventDefault();
                setMood("");
                setQuery("");
                load("catalog");
              }}
            >
              <label>
                Category
                <select
                  aria-label="Category"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Decade
                <select
                  aria-label="Decade"
                  value={decade}
                  onChange={(e) => setDecade(e.target.value)}
                >
                  <option value="">Any era</option>
                  {[
                    2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930,
                    1920,
                  ].map((d) => (
                    <option value={d} key={d}>
                      {d}s
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Time available
                <select
                  aria-label="Maximum runtime"
                  value={runtime}
                  onChange={(e) => setRuntime(e.target.value)}
                >
                  <option value="">Any length</option>
                  <option value="90">Under 90 minutes</option>
                  <option value="120">Under 2 hours</option>
                  <option value="180">Under 3 hours</option>
                </select>
              </label>
              <label>
                Community rating
                <select
                  aria-label="Minimum rating"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                >
                  <option value="">Any rating</option>
                  <option value="3.5">3.5+ / 5</option>
                  <option value="4">4+ / 5</option>
                </select>
              </label>
              <label>
                Sort by
                <select
                  aria-label="Sort movies"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="popular">Most popular</option>
                  <option value="rating">Highest rated</option>
                  <option value="newest">Newest first</option>
                </select>
              </label>
              <button className="primary">Apply filters</button>
              <button
                type="button"
                className="quiet"
                onClick={() => {
                  sound.playClick(450);
                  setGenre("");
                  setDecade("");
                  setRuntime("");
                  setMinScore("");
                  setSort("popular");
                  setMood("");
                  setQuery("");
                  load("catalog", 0, "");
                }}
              >
                Reset
              </button>
            </form>
            {/* 🍿 Quick Cinema Curator Filter Pills */}
            <div className="quick-curator-filter-strip" style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "14px 0 20px" }}>
              <button
                type="button"
                className="curator-pill-btn"
                onClick={() => {
                  sound.playClick(640);
                  setSort("popular");
                  load("catalog");
                  setNotice("Showing films with verified YouTube trailers");
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "rgba(245, 197, 24, 0.12)",
                  border: "1px solid rgba(245, 197, 24, 0.35)",
                  color: "var(--gold)",
                  borderRadius: "999px",
                  padding: "7px 16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Play size={12} fill="currentColor" />
                <span>Watch Official YouTube Trailers</span>
              </button>

              <button
                type="button"
                className="curator-pill-btn"
                onClick={() => {
                  sound.playClick(640);
                  setDecade("2020");
                  setSort("newest");
                  load("catalog");
                  setNotice("Filtered to Latest 2024–2026 Releases");
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#e2e8f0",
                  borderRadius: "999px",
                  padding: "7px 16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Sparkles size={13} className="text-gold" />
                <span>Latest Cinema (2024–2026)</span>
              </button>

              <button
                type="button"
                className="curator-pill-btn"
                onClick={() => {
                  sound.playClick(640);
                  setMinScore("4");
                  setSort("rating");
                  load("catalog");
                  setNotice("Filtered to Masterpiece Cinema (4.0+ Rating)");
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#e2e8f0",
                  borderRadius: "999px",
                  padding: "7px 16px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Star size={13} fill="#f5c518" color="#f5c518" />
                <span>Highest Rated Masterpieces</span>
              </button>
            </div>
            </>
          )}
          {tab === "Watch journal" && (
            <div className="journal-summary">
              <strong>
                {entries.filter((e) => e.watched).length} films watched
              </strong>
              <span>{entries.filter((e) => e.rating).length} rated</span>
              <span>{entries.filter((e) => e.favorite).length} favorites</span>
              <p>
                Your personal history of stories. Mark a movie as watched from
                its details.
              </p>
            </div>
          )}
          {tab === "Watchlist" && (
            <div className="watchlist-intelligence-bar">
              {[
                { id: "all", label: `All Saved (${entries.filter((e) => e.watchlist).length})` },
                { id: "tonight", label: "🌙 Watch Tonight (<2h)" },
                { id: "weekend", label: "🍿 Weekend Binge" },
                { id: "date", label: "🍷 Date Night" },
                { id: "family", label: "👨‍👩‍👧 Family Friendly" },
                { id: "mindbending", label: "🤯 Mind-Bending" },
                { id: "short", label: "⚡ Under 90 Mins" },
                { id: "comfort", label: "☕ Comfort Cinema" },
              ].map((bucket) => (
                <button
                  key={bucket.id}
                  type="button"
                  className={`watchlist-bucket-pill ${watchlistCategory === bucket.id ? "active" : ""}`}
                  onClick={() => {
                    sound.playClick(580);
                    setWatchlistCategory(bucket.id);
                  }}
                >
                  {bucket.label}
                </button>
              ))}
            </div>
          )}
          {collectionTabs.includes(tab) && (
            <div className="library-controls">
              <label>
                Search your collection
                <input
                  aria-label="Search your collection"
                  value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                  placeholder="A title you saved…"
                />
              </label>
              <label>
                Sort collection
                <select
                  aria-label="Sort collection"
                  value={librarySort}
                  onChange={(e) => {
                    sound.playClick(500);
                    setLibrarySort(e.target.value);
                  }}
                >
                  <option value="title">Title A–Z</option>
                  <option value="year">Newest first</option>
                  <option value="rating">Highest rated</option>
                </select>
              </label>
            </div>
          )}
          <section className="catalog">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  {tab === "Discover"
                    ? "CURATED BY CURIOSITY"
                    : "YOUR CINEVERSE"}
                </div>
                <h2>
                  {tab === "Discover"
                    ? mood
                      ? `${mood}, made for you`
                      : genre
                        ? `${genre} discoveries`
                        : "Great stories. New obsessions."
                    : tab === "Taste lab"
                      ? "Your next experiment"
                      : tab === "Group night"
                        ? "The shared shortlist"
                        : tab}
                </h2>
              </div>
              <span>
                {(collectionTabs.includes(tab)
                  ? visible.length
                  : total
                ).toLocaleString()}{" "}
                films to explore <SlidersHorizontal size={15} />
              </span>
            </div>
            {busy ? (
              <div className="loading" role="status">
                Finding your next great story…
              </div>
            ) : visible.length ? (
              <>
                {tab === "Group night" && groupWinner && (
                  <div className="group-winner-banner">
                    <div className="winner-info">
                      <div className="winner-trophy-icon">🏆</div>
                      <div>
                        <div className="winner-tag">OFFICIAL GROUP SELECTION TONIGHT</div>
                        <h3 className="winner-title">{groupWinner.title} ({groupWinner.year})</h3>
                        <div className="winner-meta">
                          ★ {groupWinner.score.toFixed(1)}/5 · {groupWinner.genres.join(", ")} {groupWinner.runtime ? `· ${groupWinner.runtime} min` : ""}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <button
                        type="button"
                        className="primary"
                        onClick={() => setSelected(groupWinner)}
                      >
                        Start Watch Party
                      </button>
                      <button
                        type="button"
                        className="quiet"
                        onClick={() => setGroupWinner(null)}
                      >
                        Change Film
                      </button>
                    </div>
                  </div>
                )}
                <div className="movies">
                  {visible.map((m) => (
                    <Card
                      key={m.id}
                      movie={m}
                      entries={entries}
                      save={save}
                      onWatch={(movie) => setWatchMovie(movie)}
                      isGroupTab={tab === "Group night"}
                      voteCount={groupVotes[m.id]}
                      isVetoed={groupVetoes[m.id]}
                      onVote={(movie) => {
                        sound.playClick(720);
                        setGroupVotes((prev) => ({ ...prev, [movie.id]: (prev[movie.id] || 0) + 1 }));
                        setNotice(`Voted for "${movie.title}" (+1 vote)`);
                      }}
                      onVeto={(movie) => {
                        sound.playClick(380);
                        setGroupVetoes((prev) => ({ ...prev, [movie.id]: !prev[movie.id] }));
                        setNotice(`Veto toggled for "${movie.title}"`);
                      }}
                      onChooseWinner={(movie) => {
                        sound.playChime();
                        setGroupWinner(movie);
                        setNotice(`🏆 "${movie.title}" crowned tonight's movie!`);
                      }}
                      onOpen={(m) => {
                        setMystery(false);
                        setSelected(m);
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="empty">
                Nothing here yet. Try another mood or add a movie to your
                collection.
              </div>
            )}
            {/* 🚀 Seamless Infinite Scroll Sentinel for all Feature Sections */}
            {!collectionTabs.includes(tab) && tab !== "Swipe Mode" && (
              <div
                ref={sentinelRef}
                className="infinite-scroll-sentinel"
                style={{
                  padding: "36px 0 28px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px",
                  width: "100%",
                }}
              >
                {loadingMore && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "var(--gold, #f5c518)",
                      fontSize: "13px",
                      fontWeight: 600,
                      background: "rgba(245, 197, 24, 0.08)",
                      padding: "8px 22px",
                      borderRadius: "999px",
                      border: "1px solid rgba(245, 197, 24, 0.25)",
                    }}
                  >
                    <Film size={15} />
                    <span>Loading more cinema discoveries ({visible.length} of {total.toLocaleString()})...</span>
                  </div>
                )}

                {!loadingMore && offset + 24 < total && (
                  <button
                    type="button"
                    className="load-more-btn"
                    onClick={() => {
                      sound.playClick(600);
                      void loadMore();
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "9px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      color: "#f1f5f9",
                      padding: "10px 24px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>Explore more films ({visible.length} of {total.toLocaleString()})</span>
                    <ArrowRight size={14} />
                  </button>
                )}

                {!loadingMore && total > 0 && visible.length >= total && (
                  <div
                    style={{
                      color: "var(--muted, #64748b)",
                      fontSize: "12px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "8px 16px",
                    }}
                  >
                    ✓ All {total.toLocaleString()} curated films in this section explored
                  </div>
                )}
              </div>
            )}
          </section>
          <footer>
            <span className="wordmark">
              CINEVERSE<span>AI</span>
            </span>
            <p>Made for the love of the story.</p>
            <small>
              MovieLens ratings · TMDB metadata when connected.
              <br />
              This product uses the TMDB API but is not endorsed or certified by
              TMDB.
            </small>
          </footer>
        </main>
      </div>
      {/* 🎬 IMDb-GRADE RICH MOVIE MODAL (CAST, RATINGS, TRIVIA, DNA, WATCH) */}
      <MovieModal
        movie={selected as any}
        isOpen={Boolean(selected) && !mystery}
        onClose={() => setSelected(null)}
        onWatch={(movie) => {
          setSelected(null);
          setWatchMovie(movie as any);
        }}
        onSave={(movie, updates) => save(movie as any, updates)}
        onFuse={(movie) => addMovieToFusion(movie as any)}
        onMoreLikeThis={async (movie) => {
          sound.playChime();
          setSelected(null);
          setTab("Taste lab");
          setLabStep("fusion");
          setFusionMovies([movie as any]);
          setFusion([movie.id]);
          setBusy(true);
          const version = ++requestVersion.current;
          try {
            const d = await api("/discover", {
              fusion: [movie.id],
              mode: "fusion",
            });
            if (version === requestVersion.current) {
              setItems(d.items);
              setTotal(d.total);
              setNotice(`More stories like ${movie.title}`);
            }
          } catch (e) {
            setError((e as Error).message);
          } finally {
            if (version === requestVersion.current) setBusy(false);
          }
        }}
        onSearchQuery={(q) => {
          setSelected(null);
          setQuery(q);
          setTab("Discover");
        }}
        isWatchlist={Boolean(entries.find((e) => e.movie.id === selected?.id)?.watchlist)}
        isFavorite={Boolean(entries.find((e) => e.movie.id === selected?.id)?.favorite)}
        isWatched={Boolean(entries.find((e) => e.movie.id === selected?.id)?.watched)}
        isDismissed={Boolean(entries.find((e) => e.movie.id === selected?.id)?.dismissed)}
      />

      {/* 🔮 Mystery Movie Reveal Overlay */}
      {selected && mystery && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <motion.section
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Mystery movie"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Close"
              onClick={() => {
                sound.playClick(420);
                setSelected(null);
              }}
            >
              <X />
            </button>
            <div className="mystery-icon">✧</div>
            <h2>A story worth the leap.</h2>
            <p>
              {selected.genres.join(" · ")} · {selected.year}
            </p>
            <p>
              A {selected.score.toFixed(1)}/5 community-rated discovery. Go
              in knowing less.
            </p>
            <button
              className="primary"
              onClick={() => {
                sound.playChime();
                setMystery(false);
              }}
            >
              Reveal my mystery movie
            </button>
          </motion.section>
        </div>
      )}

      {/* 🎬 WATCH NOW STREAMING & SERVER HUB MODAL */}
      <WatchModal
        movie={watchMovie as any}
        isOpen={Boolean(watchMovie)}
        onClose={() => setWatchMovie(null)}
        onOpenDetails={(movie) => {
          setWatchMovie(null);
          setSelected(movie as any);
        }}
      />

      {/* 🔍 UNIVERSAL FAST SEARCH MODAL */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectMovie={(movie) => {
          setSearchOpen(false);
          setSelected(movie as any);
        }}
        onWatchMovie={(movie) => {
          setSearchOpen(false);
          setWatchMovie(movie as any);
        }}
      />

      {/* 👤 SHOW PROFILE QUICK MODAL */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        profileName={accountName || "Cinephile Explorer"}
        watchedCount={entries.filter((e) => e.watched).length || 42}
        watchlistCount={entries.filter((e) => e.watchlist).length || 18}
        ratingsCount={entries.filter((e) => e.rating !== null && e.rating !== undefined).length || 36}
        dna={dna}
      />

      {authOpen && (
        <div className="overlay">
          <motion.section
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Account"
          >
            <button
              className="close"
              onClick={() => setAuthOpen(false)}
              aria-label="Close account"
            >
              <X />
            </button>
            <h2>Your own universe.</h2>
            <a className="intro-cta" href="/profile">
              Edit profile <ArrowUpRight size={16} />
            </a>
            <p>
              Signed in as {accountName}. Your lists and ratings are saved to
              your account.
            </p>
            <button
              className="quiet"
              onClick={async () => {
                try {
                  if (supabase) {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                  } else await api("/auth/logout", {});
                  setAccountName("");
                  localStorage.removeItem("cineverse-demo");
                  setEntries([]);
                  setDna({});
                  setAuthOpen(false);
                  setNotice("Signed out.");
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Sign out
            </button>
          </motion.section>
        </div>
      )}

      {/* 🧬 COLD-START CALIBRATION MODAL */}
      {coldStartOpen && (
        <div className="overlay" onClick={() => setColdStartOpen(false)}>
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal"
            style={{ maxWidth: "780px" }}
            role="dialog"
            aria-modal="true"
            aria-label="Cold-Start Onboarding"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setColdStartOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <div className="eyebrow" style={{ color: "var(--green)" }}>COLD-START ONBOARDING · RESEARCH RECSYS</div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "6px 0 8px" }}>
              Pick 5 Movies You Love
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.5", marginBottom: "16px" }}>
              Instead of forcing dozens of tedious star ratings, choose 5 seminal films. Our hybrid engine will instantly synthesize your multi-dimensional 7D Taste DNA profile.
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: coldStartSelected.length >= 5 ? "var(--green)" : "var(--text)" }}>
                Selected: {coldStartSelected.length} / 5 required
              </span>
              {coldStartSelected.length > 0 && (
                <button
                  type="button"
                  className="quiet"
                  style={{ fontSize: "12px", padding: "4px 8px" }}
                  onClick={() => setColdStartSelected([])}
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="cold-start-movies-grid">
              {COLD_START_MOVIES.map((cMovie) => {
                const isSelected = coldStartSelected.includes(cMovie.id);
                return (
                  <div
                    key={cMovie.id}
                    className={`cold-start-movie-item ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      sound.playClick(isSelected ? 420 : 680);
                      if (isSelected) {
                        setColdStartSelected(coldStartSelected.filter((id) => id !== cMovie.id));
                      } else {
                        if (coldStartSelected.length < 5) {
                          setColdStartSelected([...coldStartSelected, cMovie.id]);
                        } else {
                          setNotice("You have selected 5 films! Click 'Synthesize My Taste DNA' below.");
                        }
                      }
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "180px" }}>
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${cMovie.poster}`}
                        alt={cMovie.title}
                        fill
                        unoptimized
                        style={{ objectFit: "cover" }}
                      />
                      {isSelected && (
                        <div className="cold-start-check-overlay">
                          ✓
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "8px 10px", fontSize: "11px" }}>
                      <strong style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text)" }}>
                        {cMovie.title}
                      </strong>
                      <span style={{ color: "var(--muted)", fontSize: "10px" }}>
                        {cMovie.year} · {cMovie.genre.split(" / ")[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "18px" }}>
              <button
                type="button"
                className="quiet"
                onClick={() => setColdStartOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                disabled={coldStartSelected.length < 5}
                onClick={() => submitColdStart()}
                style={{
                  opacity: coldStartSelected.length >= 5 ? 1 : 0.5,
                  cursor: coldStartSelected.length >= 5 ? "pointer" : "not-allowed",
                  fontWeight: 800,
                }}
              >
                <Sparkles size={16} /> Synthesize My Taste DNA ({coldStartSelected.length}/5)
              </button>
            </div>
          </motion.section>
        </div>
      )}

      {/* 🤝 FRIEND MOVIE COMPATIBILITY MODAL */}
      {friendModalOpen && (
        <div className="overlay" onClick={() => setFriendModalOpen(false)}>
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal"
            style={{ maxWidth: "680px" }}
            role="dialog"
            aria-modal="true"
            aria-label="Friend Movie Compatibility"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setFriendModalOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <div className="eyebrow" style={{ color: "var(--green)" }}>TASTE ALIGNMENT MATRIX · COLLABORATIVE DYNAMICS</div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "6px 0 8px" }}>
              Movie Compatibility Between Friends
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
              Compare multi-vector taste profiles between two cinema lovers to discover mutual alignment and co-watching recommendations.
            </p>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--muted)" }}>Compare with:</span>
              {["Alex", "Sarah", "Maya", "David"].map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`tonight-choice-btn ${friendName === name ? "active" : ""}`}
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => {
                    sound.playClick(600);
                    setFriendName(name);
                  }}
                >
                  👤 {name}
                </button>
              ))}
            </div>

            <div
              style={{
                background: "rgba(206, 247, 160, 0.08)",
                border: "1px solid rgba(206, 247, 160, 0.3)",
                borderRadius: "16px",
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--green)", letterSpacing: "1px" }}>
                  {accountName ? accountName.toUpperCase() : "ANJAN"} × {friendName.toUpperCase()}
                </span>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff", margin: "4px 0" }}>
                  🎬 Movie Taste Match: 87%
                </div>
                <div style={{ fontSize: "12px", color: "#b9c7bf" }}>
                  High synergy in Sci-Fi, Psychological Thrillers, and High-Concept Directors.
                </div>
              </div>
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  border: "4px solid var(--green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: 900,
                  color: "var(--green)",
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                87%
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", borderRadius: "14px", padding: "14px" }}>
                <strong style={{ fontSize: "12px", color: "var(--text)", display: "block", marginBottom: "8px" }}>
                  📊 Shared Genre Alignment
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span>Sci-Fi</span>
                      <strong style={{ color: "var(--green)" }}>96% Overlap</strong>
                    </div>
                    <div className="dna-bar-track">
                      <div className="dna-bar-fill" style={{ width: "96%" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span>Thriller</span>
                      <strong style={{ color: "var(--green)" }}>91% Overlap</strong>
                    </div>
                    <div className="dna-bar-track">
                      <div className="dna-bar-fill" style={{ width: "91%" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span>Drama</span>
                      <strong style={{ color: "var(--green)" }}>84% Overlap</strong>
                    </div>
                    <div className="dna-bar-track">
                      <div className="dna-bar-fill" style={{ width: "84%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", borderRadius: "14px", padding: "14px" }}>
                <strong style={{ fontSize: "12px", color: "var(--text)", display: "block", marginBottom: "8px" }}>
                  🎬 Shared Directors & Actors
                </strong>
                <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "#a8b5ae", lineHeight: "1.7" }}>
                  <li><strong>Christopher Nolan</strong> (Shared 5★ ratings)</li>
                  <li><strong>Denis Villeneuve</strong> (Dune, Blade Runner)</li>
                  <li><strong>David Fincher</strong> (Se7en, Zodiac)</li>
                  <li><strong>Leonardo DiCaprio</strong> (92% co-view rate)</li>
                </ul>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", borderRadius: "14px", padding: "14px", marginBottom: "20px" }}>
              <strong style={{ fontSize: "12px", color: "var(--green)", display: "block", marginBottom: "4px" }}>
                🎯 Top Joint Recommendation For Tonight:
              </strong>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: "2px 0", fontSize: "15px" }}>Dune: Part Two (2024)</h4>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)" }}>
                    Because both of you rated Interstellar and Blade Runner 2049 5 stars.
                  </p>
                </div>
                <span className="dashboard-badge-active" style={{ fontSize: "12px" }}>
                  94% Match
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="quiet"
                onClick={() => setFriendModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  setFriendModalOpen(false);
                  navigate("Group night");
                  setNotice(`Switched to Group Night with Room MOVIE-7821 to watch together!`);
                }}
              >
                🍿 Open Room MOVIE-7821
              </button>
            </div>
          </motion.section>
        </div>
      )}

      {/* 🌙 TONIGHT MODE QUICK DECISION MODAL */}
      {tonightModalOpen && (
        <div className="overlay" onClick={() => setTonightModalOpen(false)}>
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal"
            style={{ maxWidth: "680px" }}
            role="dialog"
            aria-modal="true"
            aria-label="Tonight Mode Decision Studio"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setTonightModalOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <div className="eyebrow" style={{ color: "var(--green)" }}>TONIGHT MODE · QUICK DECISION STUDIO</div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "6px 0 6px" }}>
              “What should I watch tonight?”
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "18px" }}>
              Select your mood, time, and company. Our hybrid context engine calculates your ultimate recommendation instantly.
            </p>

            <div className="tonight-question-row">
              <label>1. Mood</label>
              <div className="tonight-choice-group">
                {RESEARCH_MOODS.map((rm) => (
                  <button
                    key={rm.id}
                    type="button"
                    className={`tonight-choice-btn ${tonightMood === rm.id ? "active" : ""}`}
                    onClick={() => {
                      sound.playClick(600);
                      setTonightMood(rm.id);
                    }}
                  >
                    {rm.emoji} {rm.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="tonight-question-row">
              <label>2. Available Time Window</label>
              <div className="tonight-choice-group">
                {[
                  { id: "90", label: "⚡ < 90 mins" },
                  { id: "120", label: "🎬 < 2 hours" },
                  { id: "180", label: "🍿 2+ hours" },
                  { id: "all", label: "✨ Any runtime" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`tonight-choice-btn ${tonightTime === t.id ? "active" : ""}`}
                    onClick={() => {
                      sound.playClick(620);
                      setTonightTime(t.id);
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="tonight-question-row">
              <label>3. Watching With</label>
              <div className="tonight-choice-group">
                {[
                  { id: "solo", label: "👤 Solo" },
                  { id: "couple", label: "💑 Date Night" },
                  { id: "friends", label: "🍿 Friends" },
                  { id: "family", label: "👨‍👩‍👧 Family" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`tonight-choice-btn ${tonightCompany === c.id ? "active" : ""}`}
                    onClick={() => {
                      sound.playClick(640);
                      setTonightCompany(c.id);
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="primary"
                style={{ width: "100%", padding: "14px", fontSize: "15px", fontWeight: 800 }}
                onClick={async () => {
                  await generateTonightFilm();
                }}
              >
                <Sparkles size={16} /> Generate Tonight's Film 🍿
              </button>
            </div>

            {tonightResult && (
              <div style={{ marginTop: "20px", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ position: "relative", width: "100px", height: "150px", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                    <Image
                      src={tonightResult.poster ? `https://image.tmdb.org/t/p/w342${tonightResult.poster}` : "/poster.svg"}
                      alt={tonightResult.title}
                      fill
                      unoptimized
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className="dashboard-badge-active" style={{ fontSize: "11px" }}>
                      🏆 97% TONIGHT'S PICK
                    </span>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "4px 0 2px" }}>
                      {tonightResult.title} ({tonightResult.year})
                    </h3>
                    <p style={{ color: "var(--muted)", fontSize: "11px", margin: "0 0 6px" }}>
                      {tonightResult.genres.join(" · ")} {tonightResult.runtime ? `· ${tonightResult.runtime} min` : ""}
                    </p>
                    <p style={{ fontSize: "12px", lineHeight: "1.4", color: "#d2ddd6", margin: "0 0 10px" }}>
                      {tonightResult.overview ? (tonightResult.overview.length > 140 ? tonightResult.overview.slice(0, 140) + "..." : tonightResult.overview) : ""}
                    </p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="primary"
                        style={{ fontSize: "12px", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #f5c518 0%, #eab308 100%)", color: "#080c14", fontWeight: 700 }}
                        onClick={() => {
                          setTonightModalOpen(false);
                          setWatchMovie(tonightResult);
                        }}
                      >
                        <Play size={13} fill="currentColor" /> Watch Trailer
                      </button>
                      <button
                        type="button"
                        style={{ fontSize: "12px", padding: "8px 14px" }}
                        onClick={() => {
                          setTonightModalOpen(false);
                          setSelected(tonightResult);
                        }}
                      >
                        Full Details
                      </button>
                      <button
                        type="button"
                        style={{ fontSize: "12px", padding: "8px 14px" }}
                        onClick={() => {
                          sound.playClick(680);
                          save(tonightResult, { watchlist: true });
                          setNotice(`Saved "${tonightResult.title}" to Watchlist!`);
                        }}
                      >
                        <Bookmark size={13} /> Save to Watchlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        </div>
      )}
    </div>
  );
}
