"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  Coins,
  Twitter,
  Vote,
  ArrowRight,
  Zap,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { sampleProject } from "@/src/lib/sample-data";
import type { ContractEntry } from "@/src/lib/sample-data";

const ease = [0.22, 1, 0.36, 1] as const;

interface ProjectFormProps {
  onSubmit: (data: {
    projectName: string;
    githubUrl: string;
    tokenAddress: string;
    chain: string;
    contracts: ContractEntry[];
    twitterHandle: string;
    governanceSpace: string;
    demo: boolean;
  }) => void;
  loading: boolean;
}

const FIELDS: {
  key: string;
  label: string;
  placeholder: string;
  icon: typeof Zap;
  required?: boolean;
}[] = [
  {
    key: "projectName",
    label: "PROJECT NAME",
    placeholder: "e.g. NexusNet",
    icon: Zap,
    required: true,
  },
  {
    key: "githubUrl",
    label: "GITHUB URL",
    placeholder: "https://github.com/org/repo",
    icon: Github,
  },
  {
    key: "twitterHandle",
    label: "TWITTER/X HANDLE",
    placeholder: "@projecthandle",
    icon: Twitter,
  },
  {
    key: "governanceSpace",
    label: "GOVERNANCE SPACE",
    placeholder: "project.eth (Snapshot)",
    icon: Vote,
  },
];

export function ProjectForm({ onSubmit, loading }: ProjectFormProps) {
  const [form, setForm] = useState({
    projectName: "",
    githubUrl: "",
    chain: "ethereum",
    twitterHandle: "",
    governanceSpace: "",
  });
  const [contracts, setContracts] = useState<ContractEntry[]>([
    { label: "", address: "", chain: "ethereum" },
  ]);

  function fillDemo() {
    setForm({
      projectName: sampleProject.projectName,
      githubUrl: sampleProject.githubUrl || "",
      chain: sampleProject.chain || "ethereum",
      twitterHandle: sampleProject.twitterHandle || "",
      governanceSpace: sampleProject.governanceSpace || "",
    });
    setContracts(
      sampleProject.contracts ?? [
        { label: "Token", address: sampleProject.tokenAddress || "", chain: "ethereum" },
      ]
    );
  }

  function addContract() {
    setContracts((prev) => [...prev, { label: "", address: "", chain: "ethereum" }]);
  }

  function removeContract(i: number) {
    setContracts((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateContract(i: number, field: keyof ContractEntry, value: string) {
    setContracts((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    );
  }

  function handleSubmit(demo: boolean) {
    if (!form.projectName) return;
    const validContracts = contracts.filter((c) => c.address.trim());
    onSubmit({
      ...form,
      tokenAddress: validContracts[0]?.address || "",
      contracts: validContracts,
      demo,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="w-full max-w-xl border-2 border-foreground"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-2">
        <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">
          project_input.cfg
        </span>
        <button
          onClick={fillDemo}
          className="text-[10px] tracking-widest text-[#ea580c] uppercase font-mono hover:underline cursor-pointer"
        >
          LOAD DEMO
        </button>
      </div>

      {/* Standard fields */}
      <div className="flex flex-col">
        {FIELDS.map((field, i) => {
          const Icon = field.icon;
          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease }}
              className="flex items-center border-b border-foreground/20"
            >
              <div className="flex items-center justify-center w-10 h-10 border-r border-foreground/20 shrink-0">
                <Icon size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 flex flex-col px-3 py-2">
                <label className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-0.5">
                  {field.label}
                  {field.required && (
                    <span className="text-[#ea580c] ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground/50 outline-none w-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Contracts section */}
      <div className="border-b border-foreground/20">
        <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/10">
          <span className="text-[8px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            CONTRACTS
          </span>
          <button
            onClick={addContract}
            className="flex items-center gap-1 text-[8px] font-mono tracking-wider uppercase text-[#ea580c] hover:underline cursor-pointer"
          >
            <Plus size={10} />
            ADD
          </button>
        </div>
        {contracts.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.3, ease }}
            className="flex items-center border-b border-foreground/10 last:border-b-0"
          >
            <div className="flex items-center justify-center w-10 h-10 border-r border-foreground/20 shrink-0">
              <Coins size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1 flex gap-2 px-3 py-2">
              <div className="w-24 shrink-0">
                <label className="text-[7px] tracking-[0.15em] uppercase text-muted-foreground/50 font-mono block mb-0.5">
                  LABEL
                </label>
                <input
                  type="text"
                  value={c.label}
                  onChange={(e) => updateContract(i, "label", e.target.value)}
                  placeholder="Token"
                  className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/30 outline-none w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-[7px] tracking-[0.15em] uppercase text-muted-foreground/50 font-mono block mb-0.5">
                  ADDRESS
                </label>
                <input
                  type="text"
                  value={c.address}
                  onChange={(e) => updateContract(i, "address", e.target.value)}
                  placeholder="0x..."
                  className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/30 outline-none w-full"
                />
              </div>
              <div className="w-20 shrink-0">
                <label className="text-[7px] tracking-[0.15em] uppercase text-muted-foreground/50 font-mono block mb-0.5">
                  CHAIN
                </label>
                <input
                  type="text"
                  value={c.chain ?? "ethereum"}
                  onChange={(e) => updateContract(i, "chain", e.target.value)}
                  placeholder="ethereum"
                  className="bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/30 outline-none w-full"
                />
              </div>
            </div>
            {contracts.length > 1 && (
              <button
                onClick={() => removeContract(i)}
                className="px-2 text-muted-foreground/40 hover:text-[#ef4444] cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Submit buttons */}
      <div className="flex border-t-2 border-foreground">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSubmit(true)}
          disabled={loading || !form.projectName}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-foreground text-background text-xs font-mono tracking-widest uppercase disabled:opacity-40 cursor-pointer border-r border-foreground"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          {loading ? "ANALYZING..." : "DEMO MODE"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSubmit(false)}
          disabled={loading || !form.projectName}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#ea580c] text-white text-xs font-mono tracking-widest uppercase disabled:opacity-40 cursor-pointer"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ArrowRight size={14} />
          )}
          {loading ? "ANALYZING..." : "LIVE ANALYSIS"}
        </motion.button>
      </div>
    </motion.div>
  );
}
