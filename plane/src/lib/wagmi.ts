import { http, createConfig } from "wagmi";
import { mainnet, linea, lineaSepolia, base } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  ssr: true,
  multiInjectedProviderDiscovery: false,
  chains: [mainnet, base, linea, lineaSepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "Pandora",
        url: typeof window !== "undefined" ? window.location.origin : "",
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [linea.id]: http(),
    [base.id]: http(),
    [lineaSepolia.id]: http(),
  },
});
