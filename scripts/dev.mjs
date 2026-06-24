// Dev launcher that raises the Node heap before starting `next dev`.
//
// Next 14's dev server can OOM while gzip-serialising its webpack persistent
// cache ("RangeError: Array buffer allocation failed") under memory pressure.
// Raising --max-old-space-size to 8GB gives real headroom (Node's default here
// is only ~4GB). Done via a wrapper (not inline `NODE_OPTIONS=… next dev`) so it
// works on Windows cmd.exe too — no cross-env dependency needed. Extra args are
// forwarded: `npm run dev -- -p 4000`.
import { spawn } from "node:child_process";

const HEAP = "--max-old-space-size=8192";
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS
  ? `${process.env.NODE_OPTIONS} ${HEAP}`
  : HEAP;

const extra = process.argv.slice(2).join(" ");
const cmd = `next dev${extra ? ` ${extra}` : ""}`;

const child = spawn(cmd, { stdio: "inherit", shell: true });
child.on("exit", (code) => process.exit(code ?? 0));
