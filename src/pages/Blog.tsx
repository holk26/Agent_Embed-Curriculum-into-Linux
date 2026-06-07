export default function Blog() {
  return (
    <div className="min-h-[100dvh] bg-terminal-black text-terminal-white font-mono p-6">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-terminal-green text-[18px] font-bold mb-4">
          {'┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'}
        </h1>
        <h2 className="text-terminal-green text-[16px] font-bold mb-2 text-center">
          {'┃  BLOG                                                              ┃'}
        </h2>
        <div className="text-terminal-green text-[12px] mb-6 text-center">
          {'┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'}
        </div>
        <p className="text-terminal-gray text-[14px] mb-4">
          Welcome to the blog section. Articles and thoughts on software engineering,
          AI, and system design will appear here.
        </p>
        <div className="border border-terminal-green-dim p-4">
          <p className="text-terminal-amber text-[13px] font-bold mb-2">
            {'[DRAFT] Building Autonomous Agents with LLMs'}
          </p>
          <p className="text-terminal-gray text-[12px]">
            Exploring patterns for building reliable autonomous agents using large
            language models, including tool use, reflection loops, and planning
            strategies...
          </p>
          <p className="text-terminal-gray-dark text-[11px] mt-2">
            Last edited: Jun 2026
          </p>
        </div>
      </div>
    </div>
  );
}
