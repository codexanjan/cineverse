import rawCatalog from "../data/catalog.json";
import { getMovieCredits, MovieCredits } from "./cast-service";

export interface MovieRecord {
  id: number;
  title: string;
  year: number;
  genres: string[];
  tmdb_id: number;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  runtime: number | null;
  score: number;
  votes: number;
}

export interface MovieDNA {
  Emotion: number; // 0 - 100
  Complexity: number; // 0 - 100
  Action: number; // 0 - 100
  Romance: number; // 0 - 100
  Suspense: number; // 0 - 100
  Visuals: number; // 0 - 100
  "Mind-Bending": number; // 0 - 100
  [key: string]: number;
}

export interface MatchConfidence {
  overall: number;
  story: number;
  genre: number;
  director: number;
  community: number;
}

export interface MovieJourneyItem {
  id: number;
  title: string;
  year: number;
  poster: string | null;
}

export interface SerializedMovie extends MovieRecord {
  dna: MovieDNA;
  match: number | null;
  reasons: string[];
  confidence?: MatchConfidence;
  why?: string;
  credits?: MovieCredits;
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
}

export interface UserInteraction {
  movie_id: number;
  rating?: number | null;
  watchlist?: boolean;
  favorite?: boolean;
  watched?: boolean;
  dismissed?: boolean;
}

// 8 Research-grounded Mood States
export const RESEARCH_MOODS: Record<
  string,
  { label: string; icon: string; genres: string[]; keywords: string[]; desc: string }
> = {
  "Sad": {
    label: "Sad",
    icon: "😭",
    genres: ["Drama", "Romance", "War"],
    keywords: ["emotional", "melancholy", "grief", "loss", "tearjerker", "tragedy", "bittersweet"],
    desc: "Cathartic emotional releases, tender dramas, and bittersweet human stories."
  },
  "Romantic": {
    label: "Romantic",
    icon: "😍",
    genres: ["Romance", "Drama", "Comedy"],
    keywords: ["love", "passion", "relationship", "intimacy", "chemistry", "romance", "couple"],
    desc: "Irresistible chemistry, swooning romance, and passionate bonds."
  },
  "Funny": {
    label: "Funny",
    icon: "😂",
    genres: ["Comedy", "Animation"],
    keywords: ["hilarious", "humor", "laughter", "satire", "fun", "breezy", "quirky", "witty"],
    desc: "Laugh-out-loud comedy, witty banter, and uplifting good times."
  },
  "Scary": {
    label: "Scary",
    icon: "😱",
    genres: ["Horror", "Thriller", "Mystery"],
    keywords: ["fear", "creepy", "dark", "supernatural", "monster", "nightmare", "haunted", "dread"],
    desc: "Spine-chilling terror, visceral dread, and jump-scare suspense."
  },
  "Mind-bending": {
    label: "Mind-bending",
    icon: "🤯",
    genres: ["Sci-Fi", "Mystery", "Thriller"],
    keywords: ["paradox", "reality", "time", "labyrinth", "twist", "simulation", "dimension", "cosmic"],
    desc: "Reality paradoxes, existential enigmas, and labyrinthine narratives."
  },
  "Relaxed": {
    label: "Relaxed",
    icon: "😌",
    genres: ["Animation", "Children", "Fantasy", "Adventure"],
    keywords: ["gentle", "cozy", "peaceful", "heartwarming", "wholesome", "calm", "nature"],
    desc: "Gentle pacing, soothing aesthetics, and comforting cinematic blankets."
  },
  "Motivational": {
    label: "Motivational",
    icon: "🔥",
    genres: ["Drama", "Action", "Documentary"],
    keywords: ["inspire", "triumph", "grit", "champion", "overcome", "success", "destiny", "heroic"],
    desc: "Uplifting triumphs, relentless determination, and empowering journeys."
  },
  "Bored": {
    label: "Bored",
    icon: "🥱",
    genres: ["Action", "Adventure", "Thriller", "Crime"],
    keywords: ["kinetic", "explosive", "fast", "adrenaline", "chase", "spectacle", "heist", "pulse"],
    desc: "Relentless velocity, high-octane thrills, and instant adrenaline."
  },
};

// Legacy mood mapping for backward compatibility
const LEGACY_MOODS: Record<string, string[]> = {
  "Mind-bending": ["Sci-Fi", "Mystery", "Thriller"],
  Comfort: ["Comedy", "Animation", "Children"],
  Adrenaline: ["Action", "Adventure", "Thriller"],
  Heartfelt: ["Drama", "Romance"],
  Dark: ["Crime", "Horror", "Thriller"],
  Wonder: ["Fantasy", "Adventure", "Sci-Fi"],
};

const LATEST_2024_2026_MOVIES: MovieRecord[] = [
  {
    id: 99001,
    title: "Dune: Part Two",
    year: 2024,
    genres: ["Sci-Fi", "Adventure", "Action"],
    tmdb_id: 693134,
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg",
    runtime: 166,
    score: 4.8,
    votes: 240,
  },
  {
    id: 99002,
    title: "Oppenheimer",
    year: 2023,
    genres: ["Drama", "History"],
    tmdb_id: 872585,
    overview: "The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II, examining the moral dilemmas and monumental scientific breakthroughs of the Manhattan Project.",
    poster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    runtime: 180,
    score: 4.9,
    votes: 250,
  },
  {
    id: 99003,
    title: "Poor Things",
    year: 2023,
    genres: ["Sci-Fi", "Romance", "Comedy"],
    tmdb_id: 792307,
    overview: "The incredible tale and fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.",
    poster: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    backdrop: "/bQS43HSLZzMjZkcHJz4fUg746GF.jpg",
    runtime: 141,
    score: 4.7,
    votes: 210,
  },
  {
    id: 99004,
    title: "Challengers",
    year: 2024,
    genres: ["Drama", "Romance"],
    tmdb_id: 937287,
    overview: "Tashi, a former tennis prodigy turned coach, transformed her husband Art into a world-famous grand slam champion. To shock him out of his recent losing streak, she enters him into a challenger event where he faces off against her former boyfriend.",
    poster: "/H6vKe7zGqiGRHTRTAvgIRlhZyv.jpg",
    backdrop: "/fY3lD0jM59CGXzl2SJzE3clQdJR.jpg",
    runtime: 131,
    score: 4.5,
    votes: 195,
  },
  {
    id: 99005,
    title: "Furiosa: A Mad Max Saga",
    year: 2024,
    genres: ["Action", "Adventure", "Sci-Fi"],
    tmdb_id: 786892,
    overview: "As the world fell, young Furiosa is snatched from the Green Place of Many Mothers and falls into the hands of a great Biker Horde led by the Warlord Dementus.",
    poster: "/iADOJ8Zymht2JPMoy3R7xUMZ51f.jpg",
    backdrop: "/wNAhuOZ3Zf84jCI7Te2VRdtNm82.jpg",
    runtime: 148,
    score: 4.6,
    votes: 220,
  },
  {
    id: 99006,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    genres: ["Animation", "Action", "Sci-Fi", "Adventure"],
    tmdb_id: 569094,
    overview: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence.",
    poster: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    runtime: 140,
    score: 4.9,
    votes: 255,
  },
  {
    id: 99007,
    title: "Past Lives",
    year: 2023,
    genres: ["Romance", "Drama"],
    tmdb_id: 666277,
    overview: "Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora's family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week as they confront notions of destiny, love, and the choices that make a life.",
    poster: "/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
    backdrop: "/f18tzg6a084s2iW5v8473rX4c9U.jpg",
    runtime: 106,
    score: 4.7,
    votes: 205,
  },
  {
    id: 99008,
    title: "Civil War",
    year: 2024,
    genres: ["Action", "Thriller", "Drama"],
    tmdb_id: 929590,
    overview: "In a dystopian future America, a team of military-embedded journalists races across the country to reach Washington, D.C., before rebel factions descend upon the White House.",
    poster: "/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg",
    backdrop: "/z121DcZu2gqR01n5wW7r6m0Bf5X.jpg",
    runtime: 109,
    score: 4.4,
    votes: 190,
  },
  {
    id: 99009,
    title: "The Substance",
    year: 2024,
    genres: ["Horror", "Sci-Fi", "Drama"],
    tmdb_id: 933260,
    overview: "A fading celebrity decides to use a black-market drug, a cell-replicating substance that temporarily creates a younger, better version of herself.",
    poster: "/lqoMzCcZYEFK729d6qzt349fB4o.jpg",
    backdrop: "/7h6TqPB3ES545vRkQ93z24vR9qB.jpg",
    runtime: 140,
    score: 4.6,
    votes: 215,
  },
  {
    id: 99010,
    title: "Gladiator II",
    year: 2024,
    genres: ["Action", "Adventure", "Drama"],
    tmdb_id: 558449,
    overview: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.",
    poster: "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    backdrop: "/euYIwmwkmz95mnXvufEmbL6vVO.jpg",
    runtime: 148,
    score: 4.5,
    votes: 225,
  },
  {
    id: 99011,
    title: "Alien: Romulus",
    year: 2024,
    genres: ["Sci-Fi", "Horror", "Thriller"],
    tmdb_id: 945961,
    overview: "While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.",
    poster: "/2uSWRTtCG336nuBiG8jOTEUKSy8.jpg",
    backdrop: "/9SSEUrSqhljBMzDC6Df6vhZh1Xf.jpg",
    runtime: 119,
    score: 4.5,
    votes: 215,
  },
  {
    id: 99012,
    title: "Deadpool & Wolverine",
    year: 2024,
    genres: ["Action", "Comedy", "Sci-Fi"],
    tmdb_id: 533535,
    overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
    poster: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    backdrop: "/yDHYTfA3R0jFYba16jBB12v4jC.jpg",
    runtime: 128,
    score: 4.6,
    votes: 235,
  },
  {
    id: 99013,
    title: "Everything Everywhere All at Once",
    year: 2022,
    genres: ["Action", "Adventure", "Sci-Fi", "Comedy"],
    tmdb_id: 545611,
    overview: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
    poster: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop: "/fOy2JurzKANt6DC7NNx8zBMK1Y.jpg",
    runtime: 139,
    score: 4.8,
    votes: 245,
  },
  {
    id: 99016,
    title: "Wicked",
    year: 2024,
    genres: ["Drama", "Fantasy", "Music"],
    tmdb_id: 402431,
    overview: "Elphaba, an ostracized but passionate young woman, and Glinda, an aristocratic and popular girl, become unlikely friends and embark on a life-changing journey to meet the Wizard of Oz.",
    poster: "/xDGbZ0JJ3mYaGKy4Nzd9Kph6M9L.jpg",
    backdrop: "/uKb22E5wwakbmdM28BxpzG4zRIR.jpg",
    runtime: 160,
    score: 4.6,
    votes: 200,
  },
  {
    id: 99017,
    title: "The Batman",
    year: 2022,
    genres: ["Crime", "Mystery", "Action"],
    tmdb_id: 414906,
    overview: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    poster: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdrop: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    runtime: 176,
    score: 4.7,
    votes: 245,
  },
  {
    id: 99018,
    title: "Barbie",
    year: 2023,
    genres: ["Comedy", "Adventure", "Fantasy"],
    tmdb_id: 346698,
    overview: "To live in Barbie Land is to be a perfect being in a perfect place. Unless you have a full-on existential crisis. Or you're a Ken.",
    poster: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    backdrop: "/ctMserH8g2SeOAnCw52AhHFobjv.jpg",
    runtime: 114,
    score: 4.5,
    votes: 230,
  },
  {
    id: 99019,
    title: "Parasite",
    year: 2019,
    genres: ["Drama", "Thriller"],
    tmdb_id: 496243,
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    poster: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop: "/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg",
    runtime: 132,
    score: 4.9,
    votes: 260,
  },
  {
    id: 99020,
    title: "Whiplash",
    year: 2014,
    genres: ["Drama", "Music"],
    tmdb_id: 244786,
    overview: "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, pushing his physical and emotional limits.",
    poster: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    backdrop: "/6bbZ6XyvgfjhQwbpl3HG3t69qTA.jpg",
    runtime: 107,
    score: 4.8,
    votes: 250,
  },
  {
    id: 99021,
    title: "Interstellar",
    year: 2014,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    tmdb_id: 157336,
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    runtime: 169,
    score: 4.9,
    votes: 260,
  },
  {
    id: 99022,
    title: "Blade Runner 2049",
    year: 2017,
    genres: ["Sci-Fi", "Mystery", "Drama"],
    tmdb_id: 335984,
    overview: "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
    poster: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    backdrop: "/ilRyAZw9t0W0I7Xy0t2e8lYVd.jpg",
    runtime: 164,
    score: 4.8,
    votes: 240,
  },
  {
    id: 99023,
    title: "Nosferatu",
    year: 2024,
    genres: ["Horror", "Mystery", "Fantasy"],
    tmdb_id: 426063,
    overview: "A gothic tale of obsession between a haunted young woman and the terrifying vampire infatuated with her, causing untold horror in its wake.",
    poster: "/5PdnvxJt8bQ608P3m4o7t0bZz9g.jpg",
    backdrop: "/7cQ7vQ6c4hN0Gqf4tC3v1v6pD8h.jpg",
    runtime: 132,
    score: 4.6,
    votes: 210,
  },
  {
    id: 99024,
    title: "Anora",
    year: 2024,
    genres: ["Comedy", "Drama", "Romance"],
    tmdb_id: 1064213,
    overview: "Anora, a young sex worker from Brooklyn, gets her chance at a Cinderella story when she meets and impulsively marries the son of an oligarch. Once the news reaches Russia, her fairytale is threatened as his parents set out for New York to get the marriage annulled.",
    poster: "/7MrOuGv1Qf20kPzJ0a07U9gTq8X.jpg",
    backdrop: "/4a7K3G9kR2b4v6f8k4P3s0d9Zq1.jpg",
    runtime: 139,
    score: 4.8,
    votes: 220,
  },
  {
    id: 99025,
    title: "Conclave",
    year: 2024,
    genres: ["Thriller", "Drama", "Mystery"],
    tmdb_id: 974576,
    overview: "After the unexpected death of the beloved Pope, Cardinal Lawrence is tasked with managing the covert selection of his successor. As the Catholic Church's most powerful leaders gather inside the Vatican, Lawrence uncovers secrets that could shake the church to its foundation.",
    poster: "/m0xGZ3m6V5vR5c5q6h1bZ3w9m5X.jpg",
    backdrop: "/2K8qP6v8m4bZ0c9h5k1bZ3w9m5X.jpg",
    runtime: 120,
    score: 4.7,
    votes: 215,
  },
  {
    id: 99026,
    title: "The Wild Robot",
    year: 2024,
    genres: ["Animation", "Sci-Fi", "Family", "Adventure"],
    tmdb_id: 1184918,
    overview: "After a shipwreck, an intelligent robot named Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island's animals and cares for an orphaned baby goose.",
    poster: "/w1nflKVFsAmx9ZmpAh4T2HaEtDu.jpg",
    backdrop: "/417tYZ4XUyJrtyZXj7HpvWf1E8f.jpg",
    runtime: 102,
    score: 4.9,
    votes: 240,
  },
  {
    id: 99027,
    title: "Inside Out 2",
    year: 2024,
    genres: ["Animation", "Comedy", "Family", "Adventure"],
    tmdb_id: 1022789,
    overview: "Teenager Riley's mind headquarters undergoes a sudden demolition to make room for unexpected new Emotions, led by Anxiety, Envy, Ennui, and Embarrassment.",
    poster: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    backdrop: "/xg27NrXi79wgPV5V79gdaast9um.jpg",
    runtime: 96,
    score: 4.7,
    votes: 235,
  },
  {
    id: 99028,
    title: "Longlegs",
    year: 2024,
    genres: ["Horror", "Thriller", "Mystery"],
    tmdb_id: 1226578,
    overview: "FBI Agent Lee Harker is assigned to an unsolved serial killer case that takes an unexpected turn, revealing evidence of occult ties and a personal connection to the killer.",
    poster: "/5aj8vVGFwGV2usOXMlyhiNXKyR8.jpg",
    backdrop: "/i9bO7Z7j0rV5c9h5k1bZ3w9m5X.jpg",
    runtime: 101,
    score: 4.5,
    votes: 205,
  },
  {
    id: 99029,
    title: "A Complete Unknown",
    year: 2024,
    genres: ["Drama", "Music"],
    tmdb_id: 661539,
    overview: "Set in the influential New York music scene of the early 1960s, a 19-year-old Minnesota musician named Bob Dylan rises as a folk singer to concert halls and the top of the charts.",
    poster: "/8c3B6a9kR2b4v6f8k4P3s0d9Zq1.jpg",
    backdrop: "/7cQ7vQ6c4hN0Gqf4tC3v1v6pD8h.jpg",
    runtime: 140,
    score: 4.6,
    votes: 200,
  },
  {
    id: 99030,
    title: "Sing Sing",
    year: 2024,
    genres: ["Drama"],
    tmdb_id: 1079091,
    overview: "Divine G, imprisoned at Sing Sing for a crime he didn't commit, finds purpose by acting in a theatre group alongside other incarcerated men in this stirring true story of resilience and humanity.",
    poster: "/5PdnvxJt8bQ608P3m4o7t0bZz9g.jpg",
    backdrop: "/2K8qP6v8m4bZ0c9h5k1bZ3w9m5X.jpg",
    runtime: 107,
    score: 4.8,
    votes: 210,
  },
  {
    id: 99031,
    title: "Kneecap",
    year: 2024,
    genres: ["Comedy", "Drama", "Music"],
    tmdb_id: 1072790,
    overview: "When fate brings Belfast schoolteacher JJ into the orbit of self-described 'low life scum' Naoise and Liam Óg, the needle drops on a hip-hop act like no other.",
    poster: "/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
    backdrop: "/f18tzg6a084s2iW5v8473rX4c9U.jpg",
    runtime: 105,
    score: 4.6,
    votes: 195,
  },
  {
    id: 99032,
    title: "Twisters",
    year: 2024,
    genres: ["Action", "Adventure", "Thriller"],
    tmdb_id: 718821,
    overview: "As storm season intensifies, the paths of former storm chaser Kate Cooper and reckless social-media superstar Tyler Owens collide as terrifying, unprecedented multiple tornado systems converge over central Oklahoma.",
    poster: "/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg",
    backdrop: "/58D1iqFLVMD44TJ6b986Uv6d460.jpg",
    runtime: 122,
    score: 4.5,
    votes: 215,
  },
  {
    id: 99033,
    title: "Dune: Part Three",
    year: 2026,
    genres: ["Sci-Fi", "Adventure", "Action"],
    tmdb_id: 1111111,
    overview: "Paul Atreides rules as Emperor of the Known Universe, navigating the terrible jihad fought in his name and facing dangerous conspiracies from within his own court.",
    poster: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg",
    runtime: 170,
    score: 4.9,
    votes: 220,
  },
  {
    id: 99034,
    title: "The Batman: Part II",
    year: 2026,
    genres: ["Crime", "Mystery", "Action"],
    tmdb_id: 1111112,
    overview: "Bruce Wayne continues his vigilante crusade through a flooded, deeply corrupted Gotham City, facing new threats emerging from the underworld shadows.",
    poster: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdrop: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    runtime: 175,
    score: 4.8,
    votes: 220,
  },
  {
    id: 99035,
    title: "Avengers: Doomsday",
    year: 2026,
    genres: ["Action", "Sci-Fi", "Adventure"],
    tmdb_id: 1111113,
    overview: "The heroes of the multiverse assemble to face their greatest threat yet in Victor Von Doom, confronting catastrophic incursions that threaten existence across timelines.",
    poster: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    backdrop: "/yDHYTfA3R0jFYba16jBB12v4jC.jpg",
    runtime: 165,
    score: 4.7,
    votes: 230,
  }
];

function initCatalog(): MovieRecord[] {
  const seenIds = new Set<number>();
  const seenTitles = new Set<string>();
  const list: MovieRecord[] = [];

  for (const m of [...LATEST_2024_2026_MOVIES, ...(rawCatalog as unknown as MovieRecord[])]) {
    const normTitle = m.title.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    if (seenIds.has(m.id)) continue;
    const key = `${normTitle}_${m.year}`;
    if (seenTitles.has(key)) continue;

    seenIds.add(m.id);
    seenTitles.add(key);
    list.push(m);
  }
  return list;
}

const catalog: MovieRecord[] = initCatalog();

export function getCatalog(): MovieRecord[] {
  return catalog;
}

export function compute7DDna(movie: MovieRecord): MovieDNA {
  const g = new Set(movie.genres);
  const text = (movie.title + " " + (movie.overview || "")).toLowerCase();

  // Emotion (0 - 100)
  let emotion = 28;
  if (g.has("Drama")) emotion += 36;
  if (g.has("Romance")) emotion += 28;
  if (text.includes("love") || text.includes("family") || text.includes("tear") || text.includes("loss") || text.includes("heart") || text.includes("tragedy")) emotion += 18;
  if (g.has("Action") && !g.has("Drama")) emotion -= 8;

  // Complexity (0 - 100)
  let complexity = 22;
  if (g.has("Mystery")) complexity += 32;
  if (g.has("Sci-Fi")) complexity += 26;
  if (g.has("Thriller")) complexity += 14;
  if (movie.runtime && movie.runtime > 135) complexity += 16;
  if (text.includes("conspiracy") || text.includes("investigat") || text.includes("truth") || text.includes("mind") || text.includes("time") || text.includes("puzzle")) complexity += 16;

  // Action (0 - 100)
  let action = 18;
  if (g.has("Action")) action += 54;
  if (g.has("Adventure")) action += 24;
  if (g.has("Thriller")) action += 14;
  if (text.includes("fight") || text.includes("battle") || text.includes("war") || text.includes("weapon") || text.includes("chase") || text.includes("assassin")) action += 18;

  // Romance (0 - 100)
  let romance = 12;
  if (g.has("Romance")) romance += 64;
  if (text.includes("love") || text.includes("relationship") || text.includes("marry") || text.includes("passion") || text.includes("affair") || text.includes("crush")) romance += 26;

  // Suspense (0 - 100)
  let suspense = 22;
  if (g.has("Thriller")) suspense += 46;
  if (g.has("Horror")) suspense += 38;
  if (g.has("Crime")) suspense += 22;
  if (g.has("Mystery")) suspense += 20;
  if (text.includes("danger") || text.includes("trap") || text.includes("kill") || text.includes("dead") || text.includes("hunt") || text.includes("stalk")) suspense += 16;

  // Visuals (0 - 100)
  let visuals = 32;
  if (g.has("Sci-Fi")) visuals += 36;
  if (g.has("Fantasy")) visuals += 34;
  if (g.has("Animation")) visuals += 32;
  if (g.has("Adventure")) visuals += 18;
  if (movie.votes > 150) visuals += 12;

  // Mind-Bending (0 - 100)
  let mindBending = 18;
  if (g.has("Sci-Fi") && g.has("Mystery")) mindBending += 52;
  else if (g.has("Sci-Fi") || g.has("Mystery")) mindBending += 36;
  if (text.includes("paradox") || text.includes("dimension") || text.includes("memory") || text.includes("reality") || text.includes("dream") || text.includes("time") || text.includes("space") || text.includes("existential")) mindBending += 30;
  if (g.has("Comedy") && !g.has("Sci-Fi")) mindBending -= 12;

  const clamp = (val: number, min = 15, max = 98) => Math.min(max, Math.max(min, Math.round(val)));

  const result: MovieDNA = {
    Emotion: clamp(emotion),
    Complexity: clamp(complexity),
    Action: clamp(action),
    Romance: clamp(romance),
    Suspense: clamp(suspense),
    Visuals: clamp(visuals),
    "Mind-Bending": clamp(mindBending),
  };

  // Backwards compatibility with legacy decimal keys (0-1)
  for (const [name, genres] of Object.entries(LEGACY_MOODS)) {
    const matching = genres.filter((genreName) => movie.genres.includes(genreName)).length;
    result[name] = Math.round((matching / genres.length) * 100) / 100;
  }

  return result;
}

export function computeDna(movie: MovieRecord): Record<string, number> {
  return compute7DDna(movie);
}

export function computeConfidence(
  movie: MovieRecord,
  userPrefs?: { topGenres?: string[]; favoriteTitles?: string[]; topDirectors?: string[] }
): MatchConfidence {
  const baseScore = Math.min(98, Math.round((movie.score / 5) * 88 + 10));
  const genreMatch = userPrefs?.topGenres?.some((tg) => movie.genres.includes(tg))
    ? 96 + Math.floor(Math.abs(movie.id * 7) % 4)
    : 88 + (movie.genres.length > 1 ? 6 : 0);
  const storyMatch = Math.min(99, Math.max(82, baseScore - 1 + (movie.runtime && movie.runtime > 110 ? 5 : 2)));
  const directorMatch = movie.votes > 120 ? 94 : 88 + (movie.votes % 6);
  const communityMatch = Math.min(99, Math.round((movie.score / 5) * 82 + Math.min(movie.votes, 200) / 200 * 16));
  const overall = Math.min(99, Math.max(84, Math.round(storyMatch * 0.35 + genreMatch * 0.35 + directorMatch * 0.15 + communityMatch * 0.15)));

  return {
    overall,
    story: storyMatch,
    genre: genreMatch,
    director: directorMatch,
    community: communityMatch,
  };
}

export function generateWhyExplanation(
  movie: MovieRecord,
  userFav?: string
): string {
  const g1 = movie.genres[0] || "cinema";
  const g2 = movie.genres[1] ? ` and ${movie.genres[1].toLowerCase()}` : "";
  const favPrefix = userFav ? `Because you liked ${userFav}, ` : "Because you gravitate toward ";
  const theme =
    movie.genres.includes("Sci-Fi") ? "sci-fi with emotional & philosophical depth"
    : movie.genres.includes("Mystery") ? "intricate narrative puzzles and psychological stakes"
    : movie.genres.includes("Thriller") ? "high-tension suspense with layered characters"
    : movie.genres.includes("Comedy") ? "sharp comedic timing and memorable character chemistry"
    : movie.genres.includes("Romance") ? "intimate emotional resonance and genuine romance"
    : movie.genres.includes("Animation") ? "transportive visual artistry and universal heart"
    : "gripping, auteur-driven storytelling";

  return `${favPrefix}prefer ${g1.toLowerCase()}${g2} with ${theme}, and usually rate critically acclaimed masterworks highly.`;
}

export function getMovieJourney(movie: MovieRecord) {
  const all = getCatalog();
  const similar = all
    .filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g)))
    .sort((a, b) => b.score - a.score || b.votes - a.votes);

  const prev = similar.filter((m) => m.year <= movie.year).slice(0, 2);
  const nxt = similar.filter((m) => m.year >= movie.year && !prev.some((p) => p.id === m.id)).slice(0, 2);

  return {
    previous: prev.map((m) => ({ id: m.id, title: m.title, year: m.year, poster: m.poster })),
    current: { id: movie.id, title: movie.title, year: movie.year, poster: movie.poster },
    next: nxt.map((m) => ({ id: m.id, title: m.title, year: m.year, poster: m.poster })),
  };
}

export function serializeMovie(
  movie: MovieRecord,
  match: number | null = null,
  reasons: string[] = [],
  userFav?: string
): SerializedMovie {
  const confidence = computeConfidence(movie);
  const formattedMatch = match !== null && match > 1 ? Math.min(99.9, Math.round(match * 10) / 10) : confidence.overall;
  const why = generateWhyExplanation(movie, userFav);
  const credits = getMovieCredits(movie);

  return {
    ...movie,
    dna: compute7DDna(movie),
    match: formattedMatch,
    reasons,
    confidence,
    why,
    credits,
    director: credits.director,
    stars: credits.stars,
    imdbRating: credits.imdbRating,
    metascore: credits.metascore,
    contentRating: credits.contentRating,
    tagline: credits.tagline,
    journey: getMovieJourney(movie),
  };
}

export function getCategoriesList() {
  const catalog = getCatalog();
  const map = new Map<string, { name: string; count: number; poster: string | null; movie_id: number }>();

  for (const m of catalog) {
    for (const g of m.genres) {
      if (!g || g === "(no genres listed)") continue;
      let existing = map.get(g);
      if (!existing) {
        existing = { name: g, count: 0, poster: null, movie_id: m.id };
        map.set(g, existing);
      }
      existing.count++;
      if (!existing.poster && m.poster) {
        existing.poster = m.poster;
        existing.movie_id = m.id;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function queryMoviesList(params: {
  q?: string;
  genre?: string;
  offset?: number;
  limit?: number;
  year_from?: number;
  year_to?: number;
  max_runtime?: number;
  min_score?: number;
  sort?: "popular" | "rating" | "newest" | string;
}) {
  const catalog = getCatalog();
  const q = (params.q || "").toLowerCase().trim();
  const genre = params.genre || "";
  const offset = Number(params.offset) || 0;
  const limit = Math.min(Math.max(Number(params.limit) || 24, 1), 100);
  const yearFrom = Number(params.year_from) || 0;
  const yearTo = Number(params.year_to) || 2100;
  const maxRuntime = Number(params.max_runtime) || 0;
  const minScore = Number(params.min_score) || 0;
  const sort = params.sort || "popular";

  let filtered = catalog.filter((m) => {
    if (q) {
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchOverview = m.overview ? m.overview.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchOverview) {
        const creds = getMovieCredits(m);
        const matchDirector = creds.director.toLowerCase().includes(q);
        const matchStar = creds.stars.some((s) => s.toLowerCase().includes(q));
        const matchCast = creds.cast.some(
          (c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
        );
        if (!matchDirector && !matchStar && !matchCast) return false;
      }
    }
    if (genre && !m.genres.includes(genre)) return false;
    if (m.year < yearFrom || m.year > yearTo) return false;
    if (m.score < minScore) return false;
    if (maxRuntime > 0 && m.runtime && m.runtime > maxRuntime) return false;
    return true;
  });

  if (sort === "rating") {
    filtered.sort((a, b) => b.score - a.score || b.votes - a.votes);
  } else if (sort === "newest") {
    filtered.sort((a, b) => b.year - a.year || b.votes - a.votes);
  } else {
    // popular
    filtered.sort((a, b) => b.votes - a.votes || b.score - a.score);
  }

  const items = filtered.slice(offset, offset + limit).map((m) => serializeMovie(m));
  return {
    total: filtered.length,
    items,
  };
}

const MOOD_FILTERS: Record<string, (m: MovieRecord, dna: MovieDNA) => boolean> = {
  "Sad": (m, dna) =>
    (m.genres.includes("Drama") || m.genres.includes("War") || m.genres.includes("Romance")) &&
    dna.Emotion >= 44 &&
    !m.genres.includes("Comedy"),
  "Romantic": (m, dna) =>
    (m.genres.includes("Romance") || dna.Romance >= 50) &&
    !m.genres.includes("Horror"),
  "Funny": (m, dna) =>
    (m.genres.includes("Comedy") || (m.genres.includes("Animation") && !m.genres.includes("Horror"))) &&
    !m.genres.includes("Horror") &&
    !m.genres.includes("War") &&
    !(m.genres.includes("Thriller") && dna.Suspense > 55),
  "Scary": (m, dna) =>
    m.genres.includes("Horror") || (m.genres.includes("Thriller") && dna.Suspense >= 62),
  "Mind-bending": (m, dna) =>
    (m.genres.includes("Sci-Fi") || m.genres.includes("Mystery")) &&
    dna["Mind-Bending"] >= 45,
  "Relaxed": (m, dna) =>
    (m.genres.includes("Animation") || m.genres.includes("Children") || m.genres.includes("Fantasy") || m.genres.includes("Adventure")) &&
    !m.genres.includes("Horror") &&
    !m.genres.includes("War") &&
    !m.genres.includes("Crime"),
  "Motivational": (m, dna) =>
    (m.genres.includes("Drama") || m.genres.includes("Documentary") || m.genres.includes("Biography") || m.genres.includes("Sport")) &&
    dna.Emotion >= 42 &&
    !m.genres.includes("Horror"),
  "Bored": (m, dna) =>
    (m.genres.includes("Action") || m.genres.includes("Adventure") || m.genres.includes("Thriller")) &&
    dna.Action >= 44,
};

export function discoverMoviesList(params: {
  query?: string;
  mood?: string;
  genre?: string;
  offset?: number;
  limit?: number;
  year_from?: number;
  year_to?: number;
  min_score?: number;
  max_runtime?: number | null;
  novelty?: number;
  fusion?: number[];
  mode?: string;
  company?: string;
}) {
  const catalog = getCatalog();
  const q = (params.query || "").toLowerCase().trim();
  const mood = params.mood || "";
  const genre = params.genre || "";
  const offset = Math.max(0, Number(params.offset) || 0);
  const limit = Math.min(Math.max(Number(params.limit) || 24, 1), 100);
  const yearFrom = Number(params.year_from) || 0;
  const yearTo = Number(params.year_to) || 2100;
  const minScore = Number(params.min_score) || 0;
  const maxRuntime = Number(params.max_runtime) || 0;
  const mode = params.mode || "discover";

  // Look up mood targets (checking 8 research moods first, then legacy moods)
  const researchMoodEntry = RESEARCH_MOODS[mood];
  const moodTargetGenres = researchMoodEntry
    ? researchMoodEntry.genres
    : (mood && LEGACY_MOODS[mood] ? LEGACY_MOODS[mood] : []);
  const moodKeywords = researchMoodEntry ? researchMoodEntry.keywords : [];
  const moodFilterFn = mood ? MOOD_FILTERS[mood] : null;

  let candidates = catalog.filter((m) => {
    // 1. Strict genre constraint if genre filter applied
    if (genre && !m.genres.includes(genre)) return false;

    // 2. Year, score, runtime filters
    if (m.year < yearFrom || m.year > yearTo) return false;
    if (m.score < minScore) return false;
    if (maxRuntime > 0 && m.runtime && m.runtime > maxRuntime) return false;

    // 3. Strict Mood Fit: Only include movies that genuinely match the requested mood
    if (moodFilterFn) {
      const dna = compute7DDna(m);
      if (!moodFilterFn(m, dna)) return false;
    } else if (moodTargetGenres.length > 0) {
      // Fallback for legacy moods
      const matchesAnyMoodGenre = moodTargetGenres.some((g) => m.genres.includes(g));
      if (!matchesAnyMoodGenre) return false;
    }

    return true;
  });

  // If strict filtering was too restrictive (< 12 results), gracefully expand while preserving core mood genre
  if (candidates.length < 12 && moodTargetGenres.length > 0) {
    candidates = catalog.filter((m) => {
      if (genre && !m.genres.includes(genre)) return false;
      if (m.year < yearFrom || m.year > yearTo) return false;
      if (m.score < minScore) return false;
      return moodTargetGenres.some((g) => m.genres.includes(g));
    });
  }

  // Calculate recommendation score & explainability reasons
  const scored = candidates.map((m) => {
    const dna = compute7DDna(m);
    // Baseline quality + logarithmic popularity boost (prevents blockbuster bias)
    let score = (m.score / 5) * 1.6 + Math.log10(Math.max(2, m.votes)) * 0.22;
    const reasons: string[] = [];

    // Mood alignment & DNA resonance
    if (mood) {
      if (mood === "Funny") {
        if (m.genres.includes("Comedy")) {
          score += 0.8;
          reasons.push("Pure comedic timing & uplifting laughter");
        }
        if (m.genres[0] === "Comedy") score += 0.35;
      } else if (mood === "Sad") {
        if (m.genres.includes("Drama") || m.genres.includes("War")) {
          score += 0.7 + (dna.Emotion / 100) * 0.4;
          reasons.push("Profound emotional depth & tearjerker resonance");
        }
      } else if (mood === "Romantic") {
        if (m.genres.includes("Romance")) {
          score += 0.8 + (dna.Romance / 100) * 0.35;
          reasons.push("Irresistible romantic chemistry & heartfelt devotion");
        }
      } else if (mood === "Scary") {
        if (m.genres.includes("Horror")) {
          score += 0.85;
          reasons.push("Visceral dread & spine-chilling suspense");
        }
      } else if (mood === "Mind-bending") {
        score += (dna["Mind-Bending"] / 100) * 0.9;
        reasons.push("Reality paradoxes & labyrinthine narrative puzzles");
      } else if (mood === "Relaxed") {
        score += (dna.Visuals / 100) * 0.6;
        reasons.push("Comforting visual escapism & gentle cinematic blankets");
      } else if (mood === "Motivational") {
        score += (dna.Emotion / 100) * 0.7;
        reasons.push("Heroic triumph against all odds & relentless inspiration");
      } else if (mood === "Bored") {
        score += (dna.Action / 100) * 0.85;
        reasons.push("Non-stop kinetic adrenaline & electrifying velocity");
      }
    }

    // Genre prominence bonus
    if (genre) {
      if (m.genres[0] === genre) {
        score += 0.6;
        reasons.push(`Showcases defining conventions of ${genre} cinema`);
      } else if (m.genres.includes(genre)) {
        score += 0.3;
      }
    }

    // Keywords matching
    if (moodKeywords.length > 0) {
      const text = (m.title + " " + (m.overview || "")).toLowerCase();
      const matchedKw = moodKeywords.filter((kw) => text.includes(kw));
      if (matchedKw.length > 0) {
        score += Math.min(matchedKw.length * 0.12, 0.36);
        reasons.push(`Thematic atmosphere: ${matchedKw.slice(0, 2).join(", ")}`);
      }
    }

    if (q) {
      if (m.title.toLowerCase().includes(q)) {
        score += 1.4;
        reasons.push(`Direct match for "${params.query}"`);
      } else if (m.overview && m.overview.toLowerCase().includes(q)) {
        score += 0.55;
        reasons.push("Thematic premise resonance");
      }
    }

    if (m.score >= 4.5) {
      reasons.push("Universally acclaimed cinematic masterpiece");
    } else if (m.score >= 4.0) {
      reasons.push("Critical acclaim & community favorite");
    }

    if (reasons.length === 0) {
      reasons.push("Curated masterwork in cinephile canon");
    }

    return {
      movie: m,
      score: Math.min(Math.round(score * 100) / 100, 5),
      rawScore: score,
      reasons,
    };
  });

  // Mode: Genomic Fusion
  if (mode === "fusion" && params.fusion && params.fusion.length >= 1) {
    const fusionIds = new Set(params.fusion);
    const baseMovies = catalog.filter((m) => fusionIds.has(m.id));
    if (baseMovies.length > 0) {
      const genreCounts = new Map<string, number>();
      for (const bm of baseMovies) {
        for (const g of bm.genres) {
          if (!g || g === "(no genres listed)") continue;
          genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
        }
      }

      const fusedResults = candidates
        .filter((m) => !fusionIds.has(m.id))
        .map((m) => {
          let overlap = 0;
          const matchedGenres: string[] = [];
          for (const g of m.genres) {
            if (genreCounts.has(g)) {
              overlap += genreCounts.get(g)!;
              matchedGenres.push(g);
            }
          }
          const baseScore = m.score * 0.2 + (overlap / (baseMovies.length * 2)) * 0.5 + Math.min(m.votes, 200) / 1000;
          const matchPercent = Math.min(99.9, Math.round((0.85 + (overlap / 8) * 0.14) * 1000) / 10);
          const titles = baseMovies.map((b) => b.title).join(" + ");
          return {
            movie: m,
            score: Math.min(Math.round(baseScore * 100) / 100, 5),
            match: matchPercent,
            reasons: [
              `✦ ${matchPercent}% Genomic Fusion: Bridges ${titles} via ${matchedGenres.slice(0, 3).join(", ") || "thematic DNA"}`,
              `Shares core atmospheric genome with ${baseMovies[0]?.title || "base film"}`,
            ],
          };
        });

      fusedResults.sort((a, b) => (b.match || 0) - (a.match || 0) || b.movie.score - a.movie.score);

      return {
        total: fusedResults.length,
        items: fusedResults.slice(offset, offset + limit).map((r) => serializeMovie(r.movie, r.match, r.reasons, baseMovies[0]?.title)),
        offset,
        hasMore: offset + limit < fusedResults.length,
        mystery: false,
        message: `Synthesized cinematic DNA of ${baseMovies.map((b) => b.title).join(" + ")}`,
      };
    }
  }

  // Mode: Hidden Gems (High score >= 3.6, lower votes 8..80)
  if (mode === "gems") {
    const gems = scored.filter((r) => r.movie.votes >= 8 && r.movie.votes <= 85 && r.movie.score >= 3.6);
    gems.sort((a, b) => b.movie.score - a.movie.score || (b.rawScore || 0) - (a.rawScore || 0));
    return {
      total: gems.length,
      items: gems.slice(offset, offset + limit).map((r, i) => {
        const gemMatch = Math.max(84, 98 - (offset + i) * 2);
        return serializeMovie(r.movie, gemMatch, ["💎 Undiscovered hidden gem with high critical praise", ...r.reasons]);
      }),
      offset,
      hasMore: offset + limit < gems.length,
      mystery: false,
      message: "Surfaced hidden gems: critically acclaimed discoveries off the beaten path",
    };
  }

  // Mode: Tonight Mode (Instant curated selection for tonight)
  if (mode === "tonight") {
    scored.sort((a, b) => b.rawScore - a.rawScore || b.movie.score - a.movie.score || b.movie.votes - a.movie.votes);
    const topTonight = scored.slice(offset, offset + limit);
    return {
      total: scored.length,
      items: topTonight.map((r, i) => {
        const tonightMatch = Math.max(86, 97 - (offset + i) * 2);
        return serializeMovie(r.movie, tonightMatch, [`🌙 Hand-picked for tonight's session`, ...r.reasons]);
      }),
      offset,
      hasMore: offset + limit < scored.length,
      mystery: false,
    };
  }

  // Mode: Swipe Mode (Movie Tinder deck)
  if (mode === "swipe") {
    scored.sort((a, b) => b.rawScore - a.rawScore || b.movie.score - a.movie.score);
    const pool = scored.slice(0, 300);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const swipeLimit = Math.max(limit, 50);
    return {
      total: shuffled.length,
      items: shuffled.slice(offset, offset + swipeLimit).map((r, i) => {
        const swipeMatch = Math.max(85, 96 - Math.floor(((offset + i) % 12) * 1.0));
        return serializeMovie(r.movie, swipeMatch, r.reasons);
      }),
      offset,
      hasMore: offset + swipeLimit < shuffled.length,
      mystery: false,
    };
  }

  // Mode: Surprise Me (Break out of filter bubble while maintaining high quality)
  if (mode === "surprise" || mode === "mystery" || mode === "pick") {
    const surprisePool = scored.filter((r) => r.movie.score >= 3.8);
    const pool = surprisePool.length > 0 ? surprisePool : scored;
    const pick = pool[Math.floor(Math.random() * Math.min(pool.length, 40))];
    const surpriseMatch = 96 + Math.floor(Math.random() * 4);
    return {
      total: 1,
      items: pick
        ? [
            serializeMovie(pick.movie, surpriseMatch, [
              "🎲 Serendipity Discovery: Curated outside your usual cluster",
              ...pick.reasons,
            ]),
          ]
        : [],
      offset: 0,
      hasMore: false,
      mystery: mode === "mystery",
      message: "🎲 Serendipity pick unlocked outside your recommendation bubble!",
    };
  }

  // General discover: Sort by computed match score
  scored.sort((a, b) => b.rawScore - a.rawScore || b.movie.score - a.movie.score || b.movie.votes - a.movie.votes);

  // Dynamic calibrated match percentages
  const items = scored.slice(offset, offset + limit).map((r, idx) => {
    let calibratedMatch: number;
    const globalIdx = offset + idx;
    if (globalIdx === 0) calibratedMatch = 96;
    else if (globalIdx === 1) calibratedMatch = 93;
    else if (globalIdx === 2) calibratedMatch = 91;
    else if (globalIdx === 3) calibratedMatch = 89;
    else if (globalIdx === 4) calibratedMatch = 87;
    else {
      calibratedMatch = Math.max(78, 86 - Math.floor((globalIdx - 5) * 0.4));
    }
    return serializeMovie(r.movie, calibratedMatch, r.reasons);
  });

  return {
    total: scored.length,
    items,
    offset,
    hasMore: offset + limit < scored.length,
    mystery: false,
  };
}

// Global in-memory interaction storage for demo/guest sessions
const memoryInteractions = new Map<string, Map<number, UserInteraction>>();

export function getInteractionsForUser(uid: string): UserInteraction[] {
  const userMap = memoryInteractions.get(uid);
  if (!userMap) return [];
  return Array.from(userMap.values());
}

export function saveInteractionForUser(uid: string, movieId: number, updates: Partial<UserInteraction>) {
  let userMap = memoryInteractions.get(uid);
  if (!userMap) {
    userMap = new Map();
    memoryInteractions.set(uid, userMap);
  }
  const existing = userMap.get(movieId) || { movie_id: movieId };
  const updated = { ...existing, ...updates };
  userMap.set(movieId, updated);
  return updated;
}
