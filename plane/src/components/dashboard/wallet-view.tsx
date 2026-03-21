"use client";

import { motion } from "framer-motion";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { mainnet, base, linea, lineaSepolia } from "wagmi/chains";
import { EASE } from "@/src/config/constants";

const CHAINS = [
  { chain: mainnet, label: "Ethereum Mainnet" },
  { chain: base, label: "Base" },
  { chain: linea, label: "Linea" },
  { chain: lineaSepolia, label: "Linea Sepolia" },
];

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletView() {
  const { address, isConnected, connector } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const currentChain = CHAINS.find((c) => c.chain.id === chainId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="space-y-4"
    >
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          WALLET
        </span>
        <span className="text-[11px] font-mono text-muted-foreground/40">
          MetaMask
        </span>
      </div>

      {!isConnected ? (
        /* Connect section */
        <div className="border border-foreground/15 rounded-xl overflow-hidden">
          <div className="border-b border-foreground/10 px-4 py-2">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
              CONNECT WALLET
            </span>
          </div>
          <div className="p-6 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-xl border border-foreground/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 35 33" fill="none">
                <path d="M32.9583 1L19.8242 10.7183L22.2666 4.99928L32.9583 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.04834 1L15.0707 10.8088L12.7401 4.99928L2.04834 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M28.2292 23.5334L24.7346 28.872L32.2187 30.9324L34.3638 23.6501L28.2292 23.5334Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M0.648438 23.6501L2.78182 30.9324L10.2659 28.872L6.77133 23.5334L0.648438 23.6501Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-center">
              <span className="text-[13px] font-mono font-bold tracking-wider uppercase block mb-1">
                MetaMask
              </span>
              <span className="text-[11px] font-mono text-muted-foreground/50">
                Connect your MetaMask wallet
              </span>
            </div>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
                disabled={isPending}
                className="w-full max-w-xs text-[12px] font-mono tracking-[0.15em] uppercase bg-[#06b6d4] text-white border border-[#06b6d4] rounded-lg px-6 py-2.5 hover:bg-[#06b6d4]/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "CONNECTING..." : `CONNECT ${connector.name}`}
              </button>
            ))}
            {error && (
              <span className="text-[11px] font-mono text-[#ef4444]">
                {error.message}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Connected section */
        <div className="space-y-3">
          {/* Account card */}
          <div className="border border-foreground/15 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                  CONNECTED
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/40">
                {connector?.name}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {/* Address */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wider uppercase">
                  ADDRESS
                </span>
                <span className="text-[12px] font-mono font-bold">
                  {address ? shortenAddress(address) : ""}
                </span>
              </div>

              {/* Balance */}
              {balance && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wider uppercase">
                    BALANCE
                  </span>
                  <span className="text-[12px] font-mono font-bold">
                    {(Number(balance.value) / 1e18).toFixed(4)} {balance.symbol}
                  </span>
                </div>
              )}

              {/* Network */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wider uppercase">
                  NETWORK
                </span>
                <span className="text-[11px] font-mono text-[#06b6d4]">
                  {currentChain?.label ?? `Chain ${chainId}`}
                </span>
              </div>

              {/* Disconnect */}
              <button
                onClick={() => disconnect()}
                className="w-full text-[11px] font-mono tracking-[0.15em] uppercase border border-foreground/20 rounded-lg px-4 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer mt-2"
              >
                DISCONNECT
              </button>
            </div>
          </div>

          {/* Switch network */}
          <div className="border border-foreground/15 rounded-xl overflow-hidden">
            <div className="border-b border-foreground/10 px-4 py-2">
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                SWITCH NETWORK
              </span>
            </div>
            <div className="divide-y divide-foreground/10">
              {CHAINS.map(({ chain, label }) => (
                <button
                  key={chain.id}
                  onClick={() => switchChain({ chainId: chain.id })}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-left transition-colors cursor-pointer ${
                    chainId === chain.id
                      ? "bg-foreground/[0.04]"
                      : "hover:bg-foreground/[0.03]"
                  }`}
                >
                  <span className="text-[12px] font-mono">{label}</span>
                  {chainId === chain.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
