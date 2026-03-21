"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { EASE } from "@/src/config/constants";
import type { ExploreProtocol } from "@/src/app/api/explore/route";

type SortKey = "tvl" | "change_1d" | "change_7d" | "score";
type TvlRange = "all" | "1b" | "100m" | "10m";

const TVL_THRESHOLDS: Record<TvlRange, number> = {
  all: 0,
  "1b": 1_000_000_000,
  "100m": 100_000_000,
  "10m": 10_000_000,
};

const TOP_CHAINS = [
  "Ethereum",
  "Solana",
  "BSC",
  "Arbitrum",
  "Base",
  "Polygon",
  "Optimism",
  "Avalanche",
];

const TOP_CATEGORIES = [
  "Dexes",
  "Lending",
  "Bridge",
  "CDP",
  "Liquid Staking",
  "Yield",
  "Derivatives",
  "RWA",
];

function formatTvl(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatPct(n: number | null): string {
  if (n === null || n === undefined) return "";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function getVerdictColor(verdict: string | null): string {
  switch (verdict) {
    case "strong":
      return "text-[#22c55e] border-[#22c55e]/30";
    case "moderate":
      return "text-[#eab308] border-[#eab308]/30";
    case "weak":
      return "text-[#06b6d4] border-[#06b6d4]/30";
    case "critical":
      return "text-[#ef4444] border-[#ef4444]/30";
    default:
      return "text-muted-foreground/30 border-foreground/10";
  }
}

export function ExploreView() {
  const [protocols, setProtocols] = useState<ExploreProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [tvlRange, setTvlRange] = useState<TvlRange>("all");
  const [sortBy, setSortBy] = useState<SortKey>("tvl");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [onlyScanned, setOnlyScanned] = useState(false);
  const [visibleCount, setVisibleCount] = useState(100);
  const [filtersOpen, setFiltersOpen] = useState(true);

  useEffect(() => {
    fetch("/api/explore")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => setProtocols(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = protocols;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (chainFilter.length > 0) {
      list = list.filter((p) =>
        p.chains.some((c) => chainFilter.includes(c))
      );
    }

    if (categoryFilter.length > 0) {
      list = list.filter((p) => categoryFilter.includes(p.category));
    }

    const threshold = TVL_THRESHOLDS[tvlRange];
    if (threshold > 0) {
      list = list.filter((p) => p.tvl >= threshold);
    }

    if (onlyScanned) {
      list = list.filter((p) => p.integrityScore !== null);
    }

    list = [...list].sort((a, b) => {
      let va: number, vb: number;
      switch (sortBy) {
        case "tvl":
          va = a.tvl;
          vb = b.tvl;
          break;
        case "change_1d":
          va = a.change_1d ?? -999;
          vb = b.change_1d ?? -999;
          break;
        case "change_7d":
          va = a.change_7d ?? -999;
          vb = b.change_7d ?? -999;
          break;
        case "score":
          va = a.integrityScore ?? -1;
          vb = b.integrityScore ?? -1;
          break;
      }
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return list;
  }, [protocols, search, chainFilter, categoryFilter, tvlRange, sortBy, sortDir, onlyScanned]);

  const visible = filtered.slice(0, visibleCount);

  function toggleChain(chain: string) {
    setChainFilter((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain]
    );
  }

  function toggleCategory(cat: string) {
    setCategoryFilter((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortBy !== col) return null;
    return sortDir === "desc" ? (
      <ChevronDown size={8} className="inline ml-0.5" />
    ) : (
      <ChevronUp size={8} className="inline ml-0.5" />
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col items-center pt-24"
      >
        <div className="border border-foreground/15 rounded-xl px-8 py-10 text-center max-w-sm">
          <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-blink mx-auto mb-3" />
          <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            LOADING PROTOCOLS
          </span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col items-center pt-24"
      >
        <div className="border border-[#ef4444]/30 rounded-xl px-8 py-10 text-center max-w-sm">
          <span className="text-[11px] tracking-[0.2em] uppercase text-[#ef4444] font-mono">
            {error}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[12px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            EXPLORE PROTOCOLS
          </span>
          <span className="text-[11px] font-mono text-muted-foreground/50 tabular-nums ml-3">
            {filtered.length.toLocaleString()} results
          </span>
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[11px] font-mono tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Filter size={10} />
          FILTERS
          {filtersOpen ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
        </button>
      </div>

      {/* Filter bar */}
      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="border border-foreground/10 rounded-xl p-3 space-y-3"
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-foreground/10 pb-2">
            <Search size={14} className="text-muted-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH PROTOCOLS..."
              className="flex-1 text-[13px] font-mono bg-transparent outline-none placeholder:text-muted-foreground/30 tracking-wider"
            />
          </div>

          {/* Chain chips */}
          <div>
            <span className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/50 font-mono block mb-1.5">
              CHAINS
            </span>
            <div className="flex flex-wrap gap-1">
              {TOP_CHAINS.map((chain) => (
                <button
                  key={chain}
                  onClick={() => toggleChain(chain)}
                  className={`px-2.5 py-1.5 text-[10px] tracking-[0.15em] uppercase font-mono rounded-md border transition-all cursor-pointer ${
                    chainFilter.includes(chain)
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/15 text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div>
            <span className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/50 font-mono block mb-1.5">
              CATEGORY
            </span>
            <div className="flex flex-wrap gap-1">
              {TOP_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1.5 text-[10px] tracking-[0.15em] uppercase font-mono rounded-md border transition-all cursor-pointer ${
                    categoryFilter.includes(cat)
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/15 text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* TVL + Only Scanned row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground/50 font-mono mr-1">
                TVL
              </span>
              {(["all", "1b", "100m", "10m"] as TvlRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTvlRange(range)}
                  className={`px-2.5 py-1.5 text-[10px] tracking-[0.15em] uppercase font-mono rounded-md border transition-all cursor-pointer ${
                    tvlRange === range
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/15 text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {range === "all"
                    ? "ALL"
                    : range === "1b"
                      ? ">$1B"
                      : range === "100m"
                        ? ">$100M"
                        : ">$10M"}
                </button>
              ))}
            </div>

            <button
              onClick={() => setOnlyScanned((o) => !o)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase font-mono rounded-md border transition-all cursor-pointer ${
                onlyScanned
                  ? "bg-[#06b6d4] text-white border-[#06b6d4]"
                  : "border-foreground/15 text-muted-foreground hover:border-foreground/30"
              }`}
            >
              ONLY SCANNED
            </button>
          </div>
        </motion.div>
      )}

      {/* Table (desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-foreground/10">
              <th className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono font-normal text-left py-2 px-2 w-10">
                #
              </th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono font-normal text-left py-2 px-2">
                PROTOCOL
              </th>
              <th
                onClick={() => handleSort("tvl")}
                className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono font-normal text-right py-2 px-2 cursor-pointer hover:text-foreground transition-colors"
              >
                TVL
                <SortIcon col="tvl" />
              </th>
              <th
                onClick={() => handleSort("change_1d")}
                className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono font-normal text-right py-2 px-2 cursor-pointer hover:text-foreground transition-colors"
              >
                24H
                <SortIcon col="change_1d" />
              </th>
              <th
                onClick={() => handleSort("change_7d")}
                className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono font-normal text-right py-2 px-2 cursor-pointer hover:text-foreground transition-colors"
              >
                7D
                <SortIcon col="change_7d" />
              </th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono font-normal text-left py-2 px-2">
                CHAIN
              </th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono font-normal text-left py-2 px-2">
                CATEGORY
              </th>
              <th
                onClick={() => handleSort("score")}
                className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono font-normal text-right py-2 px-2 cursor-pointer hover:text-foreground transition-colors"
              >
                SCORE
                <SortIcon col="score" />
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => (
              <motion.tr
                key={p.slug}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(i * 0.02, 0.4),
                  duration: 0.25,
                  ease: EASE,
                }}
                className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
              >
                <td className="text-[11px] font-mono text-muted-foreground/50 tabular-nums py-2.5 px-2">
                  {p.rank}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    {p.logo && (
                      <Image
                        src={p.logo}
                        alt={p.name}
                        width={22}
                        height={22}
                        className="rounded-full"
                        unoptimized
                      />
                    )}
                    <span className="text-[13px] font-mono font-bold tracking-wider uppercase">
                      {p.name}
                    </span>
                  </div>
                </td>
                <td className="text-[12px] font-mono tabular-nums text-right py-2.5 px-2">
                  {formatTvl(p.tvl)}
                </td>
                <td
                  className={`text-[12px] font-mono tabular-nums text-right py-2.5 px-2 ${
                    (p.change_1d ?? 0) >= 0
                      ? "text-[#22c55e]"
                      : "text-[#ef4444]"
                  }`}
                >
                  {formatPct(p.change_1d)}
                </td>
                <td
                  className={`text-[12px] font-mono tabular-nums text-right py-2.5 px-2 ${
                    (p.change_7d ?? 0) >= 0
                      ? "text-[#22c55e]"
                      : "text-[#ef4444]"
                  }`}
                >
                  {formatPct(p.change_7d)}
                </td>
                <td className="text-[11px] font-mono text-muted-foreground tracking-wider py-2.5 px-2">
                  {p.chains[0] ?? ""}
                  {p.chains.length > 1 && (
                    <span className="text-muted-foreground/40 ml-0.5">
                      +{p.chains.length - 1}
                    </span>
                  )}
                </td>
                <td className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground py-2.5 px-2">
                  {p.category}
                </td>
                <td className="text-right py-2 px-2">
                  {p.integrityScore !== null ? (
                    <span
                      className={`text-[10px] font-mono font-bold tracking-[0.1em] uppercase border px-2 py-0.5 rounded ${getVerdictColor(p.verdict)}`}
                    >
                      {p.integrityScore} {p.verdict?.toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground/30 tracking-wider">
                      UNSCANNED
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="md:hidden space-y-2">
        {visible.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: Math.min(i * 0.02, 0.4),
              duration: 0.25,
              ease: EASE,
            }}
            className="border border-foreground/10 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">
                  #{p.rank}
                </span>
                {p.logo && (
                  <Image
                    src={p.logo}
                    alt={p.name}
                    width={16}
                    height={16}
                    className="rounded-full"
                    unoptimized
                  />
                )}
                <span className="text-[12px] font-mono font-bold tracking-wider uppercase">
                  {p.name}
                </span>
              </div>
              {p.integrityScore !== null ? (
                <span
                  className={`text-[7px] font-mono font-bold tracking-[0.1em] uppercase border px-1.5 py-0.5 rounded ${getVerdictColor(p.verdict)}`}
                >
                  {p.integrityScore}
                </span>
              ) : (
                <span className="text-[9px] font-mono text-muted-foreground/30">
                  UNSCANNED
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums">
              <span>{formatTvl(p.tvl)}</span>
              <span
                className={
                  (p.change_1d ?? 0) >= 0
                    ? "text-[#22c55e]"
                    : "text-[#ef4444]"
                }
              >
                {formatPct(p.change_1d)}
              </span>
              <span className="text-muted-foreground/50">{p.chains[0]}</span>
              <span className="text-muted-foreground/40 uppercase tracking-wider">
                {p.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {visibleCount < filtered.length && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((c) => c + 100)}
            className="px-5 py-2.5 text-[11px] font-mono tracking-[0.2em] uppercase border border-foreground/15 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer"
          >
            LOAD MORE ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </motion.div>
  );
}
