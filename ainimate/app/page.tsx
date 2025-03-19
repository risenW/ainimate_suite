"use client";

import { ProjectCreator } from "@/components/project/project-creator";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Home() {
  const isMobile = useIsMobile();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-2xl">
        {isMobile && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm font-medium">
              ⚠️ This application is not optimized for mobile devices. For the
              best experience, please use a desktop or laptop computer.
            </p>
          </div>
        )}
        <div className="text-center mb-4">
          <span className="inline-block px-2 py-1 bg-yellow-500/20 rounded-md text-yellow-200 text-xs">
            🚧 Work in Progress - Expect Bugs
          </span>
        </div>
        <h1 className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          2D Animation Editor
        </h1>
        <div className="text-lg mb-12 text-center max-w-2xl mx-auto space-y-6">
          <p className="text-white/90">
            Create simple 2D animations with ease from your browser, no need to
            install any software.
          </p>
          <p className="text-white/80">
            This intuitive browser-based editor lets you create frame-by-frame
            animations, add keyframes, and export your work in various formats.
            Perfect for creating animated GIFs, short videos, and simple motion
            graphics.
          </p>
          {/* <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-25"></div>
            <p className="relative bg-black/20 rounded-lg p-4 text-sm text-white/90">
              Coming soon: AI-powered animation assistance to help bring your
              creative ideas to life faster and easier than ever before!
            </p>
          </div> */}
        </div>
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center">
          <ProjectCreator />
        </div>
        <footer className="mt-12 text-center text-sm text-white/60">
          Created by{" "}
          <a
            href="https://risingodegua.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Rising Odegua
          </a>
        </footer>
      </div>
    </main>
  );
}
