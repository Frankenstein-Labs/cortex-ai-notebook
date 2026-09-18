"use client";

import {
  Activity,
  Braces,
  ChevronDown,
  FileCode2,
  Folder,
  GitBranch,
  Play,
  Plus,
  Search,
  Server,
  Settings2,
  TerminalSquare,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "Projects", icon: Folder, active: true },
  { label: "Models", icon: Braces },
  { label: "Datasets", icon: FileCode2 },
  { label: "Experiments", icon: Activity },
  { label: "Deployments", icon: Server },
];

export const CortexLab = ({ workspaceId }: { workspaceId: string }) => {
  const [activeTab, setActiveTab] = useState("Welcome");
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#0b0f14] text-slate-200">
      <header className="flex h-12 items-center justify-between border-b border-white/10 bg-[#111820] px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-400 text-xs font-black text-slate-950">
            C
          </div>
          <span className="text-sm font-semibold tracking-wide">CORTEX</span>
          <span className="text-xs text-slate-500">/ AI Notebook</span>
          <button className="ml-4 flex items-center gap-2 rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/5">
            workspace-{workspaceId.slice(0, 8)} <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> No runtime connected
          </span>
          <button className="rounded-md p-2 hover:bg-white/5" aria-label="Settings">
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#0e141b] p-3 md:block">
          <div className="mb-4 flex items-center justify-between px-2 text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
            <span>Workspace</span>
            <Plus className="h-3.5 w-3.5" />
          </div>
          <nav className="space-y-1">
            {navItems.map(({ label, icon: Icon, active }) => (
              <Link
                key={label}
                href={active ? `/workspaces/${workspaceId}/cortex` : "#"}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${active ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 border-t border-white/10 pt-4">
            <div className="mb-3 px-2 text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Tools
            </div>
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-white/5">
                <TerminalSquare className="h-4 w-4" /> Terminal
              </button>
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-white/5">
                <GitBranch className="h-4 w-4" /> Git
              </button>
            </div>
          </div>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-10 items-center gap-1 border-b border-white/10 bg-[#111820] px-2 text-xs">
            <button
              onClick={() => setActiveTab("Welcome")}
              className={`rounded-t px-4 py-2 ${activeTab === "Welcome" ? "border-b-2 border-cyan-400 text-slate-100" : "text-slate-500"}`}>
              Welcome
            </button>
            <button className="ml-auto rounded p-2 text-slate-500 hover:bg-white/5" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-3xl">
              <div className="mb-8">
                <p className="mb-2 text-xs font-medium tracking-[0.22em] text-cyan-400 uppercase">
                  AI experimentation environment
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white">Build, run, evaluate.</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  Cortex brings notebooks, models, datasets and experiments into one reproducible workspace.
                  Connect a runtime to execute code.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <button className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left hover:border-cyan-400/40 hover:bg-cyan-400/5">
                  <FileCode2 className="mb-8 h-5 w-5 text-cyan-300" />
                  <div className="text-sm font-medium text-white">Open notebook</div>
                  <div className="mt-1 text-xs text-slate-500">Use a Jupyter-compatible file</div>
                </button>
                <button className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left hover:border-cyan-400/40 hover:bg-cyan-400/5">
                  <Play className="mb-8 h-5 w-5 text-violet-300" />
                  <div className="text-sm font-medium text-white">Create experiment</div>
                  <div className="mt-1 text-xs text-slate-500">Track an executable run</div>
                </button>
                <button className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left hover:border-cyan-400/40 hover:bg-cyan-400/5">
                  <Server className="mb-8 h-5 w-5 text-amber-300" />
                  <div className="text-sm font-medium text-white">Connect runtime</div>
                  <div className="mt-1 text-xs text-slate-500">Local, container or cloud</div>
                </button>
              </div>
              <div className="mt-8 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 text-xs text-amber-200">
                <strong>Runtime required:</strong> notebook execution is not enabled in this workspace yet.
                The shell is ready for a real Jupyter Server adapter; no fake execution is presented.
              </div>
            </div>
          </div>
          <footer className="flex h-8 items-center justify-between border-t border-white/10 bg-[#111820] px-3 text-[11px] text-slate-500">
            <span>Python kernel: unavailable</span>
            <span>Git: not connected</span>
            <span>Local control plane</span>
          </footer>
        </section>
      </div>
    </main>
  );
};
