import Link from "next/link";

const capabilities = [
  [
    "JupyterLab runtimes",
    "Real notebook servers with kernel and terminal connectivity through the secured execution plane.",
  ],
  [
    "Provider-neutral AI",
    "Connect compatible model providers and local OpenAI-compatible runtimes without coupling the product UI to one vendor.",
  ],
  [
    "Tenant-safe workspaces",
    "Projects, files, notebooks, tokens and permissions are scoped to the authenticated workspace and project.",
  ],
  [
    "Reproducible workflows",
    "The platform is being extended with registries, experiments, evaluations and deployment lineage.",
  ],
];

export default function CortexLandingPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="text-lg font-semibold tracking-[0.18em] text-cyan-300">
          CORTEX
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/auth/login" className="rounded-md px-4 py-2 text-slate-300 hover:text-white">
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-md bg-cyan-300 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-200">
            Start building
          </Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-7xl gap-14 px-6 pt-20 pb-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pt-28">
        <div>
          <p className="mb-6 text-sm font-medium tracking-[0.25em] text-cyan-300 uppercase">
            AI notebook infrastructure
          </p>
          <h1 className="max-w-4xl text-5xl leading-[1.05] font-semibold tracking-tight text-slate-50 md:text-7xl">
            Build, evaluate and deploy AI systems from one controlled workspace.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            Cortex brings notebooks, real runtimes, model and dataset workflows, experiments and secure
            provider connections into a tenant-isolated platform for engineering teams.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/auth/signup"
              className="rounded-md bg-cyan-300 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-200">
              Create a workspace
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:border-cyan-300 hover:text-cyan-200">
              Open the platform
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs text-slate-400">
            <span>cortex / runtime</span>
            <span className="text-emerald-300">execution plane</span>
          </div>
          <div className="grid gap-3 py-5 text-sm">
            {[
              "JupyterLab server",
              "Kernel and terminal channels",
              "Workspace-scoped access",
              "Provider adapters",
              "Experiment lineage",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Capabilities shown here describe the Cortex architecture. Availability depends on the services and
            providers configured by your deployment.
          </p>
        </div>
      </section>
      <section className="border-y border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
          {capabilities.map(([title, description]) => (
            <article key={title} className="border-l border-cyan-300/50 pl-4">
              <h2 className="font-semibold text-slate-100">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <span>CORTEX AI Notebook</span>
        <span>Secure by tenant isolation, scoped credentials and explicit runtime policies.</span>
      </footer>
    </main>
  );
}
