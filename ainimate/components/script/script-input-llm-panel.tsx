import { Button } from "../ui/button";

export default function ScriptInputLlmPanel() {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Script & AI Panel</h2>
      <textarea
        className="w-full h-40 p-2 border rounded bg-background text-foreground"
        placeholder="Enter your script here..."
      />
      <Button>Generate Animation</Button>
    </div>
  )
} 
