/**
 * Cineverse Media Service
 * Handles trailer playback and video references.
 * Completely removed SteamDB and multiembed references.
 */

import { getMovieTrailerEmbedUrl, getYouTubeWatchUrl } from "./trailer";

export interface MovieStreamInfo {
  id: number;
  tmdb_id?: number | null;
  title: string;
  year?: number;
}

export function getStreamDbUrl(movie: MovieStreamInfo): string {
  return getYouTubeWatchUrl(movie);
}

export function getSteamDbUrl(movie: MovieStreamInfo): string {
  return getYouTubeWatchUrl(movie);
}

export function getVidSrcUrl(movie: MovieStreamInfo): string {
  return getMovieTrailerEmbedUrl(movie);
}

export function getImdbUrl(movie: MovieStreamInfo): string {
  return getYouTubeWatchUrl(movie);
}

export function getJustWatchUrl(movie: MovieStreamInfo): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " trailer")}`;
}

export function getTmdbUrl(movie: MovieStreamInfo): string {
  return getYouTubeWatchUrl(movie);
}

export function redirectToStreamPlayer(
  movie: MovieStreamInfo,
  _destination?: string
): void {
  if (typeof window === "undefined") return;
  const targetUrl = getYouTubeWatchUrl(movie);
  window.open(targetUrl, "_blank", "noopener,noreferrer");
}
