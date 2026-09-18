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

const activities = [
  { label: "File Browser", icon: Folder },
  { label: "Running Kernels", icon: Activity },
  { label: "Command Palette", icon: TerminalSquare },
];
const navItems = [
  { label: "Projects", icon: Folder, active: true },
  { label: "Models", icon: Braces },
  { label: "Datasets", icon: FileCode2 },
  { label: "Experiments", icon: Activity },
  { label: "Deployments", icon: Server },
];

export const CortexLab = ({ workspaceId }: { workspaceId: string }) => {
  const [activeActivity, setActiveActivity] = useState("File Browser");
  const [activeTab, setActiveTab] = useState("Welcome");
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#0b0f14] text-slate-200">
      <header className="flex h-10 items-center border-b border-white/10 bg-[#111820] px-3 text-xs">
        <div className="mr-5 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-400 text-xs font-black text-slate-950">
            C
          </div>
          <span className="font-semibold tracking-wide text-white">CORTEX</span>
        </div>
        <nav className="flex h-full items-center gap-1 text-slate-400">
          {["File", "Edit", "View", "Run", "Kernel", "Tabs", "Settings", "Help"].map((item) => (
            <button key={item} className="h-full px-2.5 hover:bg-white/5 hover:text-white">
              {item}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-slate-400">
          <span className="hidden sm:inline">AI Notebook</span>
          <button className="flex items-center gap-1 rounded border border-white/10 px-2 py-1 hover:bg-white/5">
            workspace-{workspaceId.slice(0, 8)} <ChevronDown className="h-3 w-3" />
          </button>
          <Settings2 className="h-4 w-4" />
        </div>
      </header>
      <div className="flex h-8 items-center border-b border-white/10 bg-[#0e141b] px-3 text-[11px] text-slate-400">
        <span className="mr-4 text-cyan-300">Cortex Workspace</span>
        <span>Notebook</span>
        <span className="mx-2 text-slate-600">/</span>
        <span>Welcome</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> JupyterHub runtime unavailable
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-11 shrink-0 flex-col items-center border-r border-white/10 bg-[#0b1016] py-2 md:flex">
          {activities.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveActivity(label)}
              aria-label={label}
              className={`mb-2 rounded p-2.5 ${activeActivity === label ? "bg-cyan-400/15 text-cyan-300" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"}`}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </aside>
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#0e141b] p-3 md:block">
          <div className="mb-4 flex items-center justify-between px-2 text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
            <span>{activeActivity}</span>
            <Plus className="h-3.5 w-3.5" />
          </div>
          {activeActivity === "File Browser" ? (
            <>
              <div className="mb-4 rounded border border-white/10 bg-black/10 px-2.5 py-2 text-xs text-slate-400">
                <Folder className="mr-2 inline h-3.5 w-3.5 text-cyan-300" /> project-root
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
            </>
          ) : (
            <p className="px-2 text-xs leading-5 text-slate-500">
              No active {activeActivity.toLowerCase()}. Connect a real JupyterHub runtime to populate this
              panel.
            </p>
          )}
          <div className="mt-8 border-t border-white/10 pt-4">
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-white/5">
              <GitBranch className="h-4 w-4" /> Cortex Git
            </button>
          </div>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-9 items-center gap-1 border-b border-white/10 bg-[#111820] px-2 text-xs">
            <button
              onClick={() => setActiveTab("Welcome")}
              className={`rounded-t px-4 py-2 ${activeTab === "Welcome" ? "border-b-2 border-cyan-400 text-slate-100" : "text-slate-500"}`}>
              Welcome
            </button>
            <button className="ml-auto rounded p-2 text-slate-500 hover:bg-white/5" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-auto p-6">
            <div className="w-full max-w-3xl">
              <div className="mb-8">
                <p className="mb-2 text-xs font-medium tracking-[0.22em] text-cyan-400 uppercase">
                  JupyterLab workspace
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white">Build, run, evaluate.</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  Cortex uses the JupyterLab work area for notebooks, terminals and code consoles, while
                  JupyterHub manages isolated user servers.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  [FileCode2, "Open notebook", "Use a Jupyter-compatible file", "text-cyan-300"],
                  [Play, "Create experiment", "Track an executable run", "text-violet-300"],
                  [Server, "Connect runtime", "Start a JupyterHub server", "text-amber-300"],
                ].map(([Icon, title, description, color]) => {
                  const Component = Icon as typeof FileCode2;
                  return (
                    <button
                      key={title as string}
                      className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left hover:border-cyan-400/40 hover:bg-cyan-400/5">
                      <Component className={`mb-8 h-5 w-5 ${color}`} />
                      <div className="text-sm font-medium text-white">{title as string}</div>
                      <div className="mt-1 text-xs text-slate-500">{description as string}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4 text-xs text-amber-200">
                <strong>JupyterHub not connected:</strong> the file browser, kernel list, terminals and
                notebook execution remain unavailable until a verified adapter health check succeeds.
              </div>
            </div>
          </div>
          <footer className="flex h-8 items-center justify-between border-t border-white/10 bg-[#111820] px-3 text-[11px] text-slate-500">
            <span>Python kernel: unavailable</span>
            <span>Git: internal adapter ready</span>
            <span>JupyterLab layout: active</span>
          </footer>
        </section>
        <aside className="hidden w-52 shrink-0 border-l border-white/10 bg-[#0e141b] p-3 xl:block">
          <div className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
            Property Inspector
          </div>
          <div className="rounded border border-white/10 bg-black/10 p-3 text-xs leading-5 text-slate-500">
            Select a notebook cell or activity to inspect its properties. This panel maps to the JupyterLab
            right sidebar.
          </div>
        </aside>
      </div>
    </main>
  );
};
