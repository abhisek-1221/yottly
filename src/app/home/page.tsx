import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Hand, Plane, Wrench, Youtube } from "lucide-react";
import YouTube from '../icons/yt';

const ChatInterface = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-6xl bg-black border-zinc-800 shadow-xl shadow-stone-600">
        <CardContent className="p-6 flex flex-col min-h-[700px]">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <YouTube className="w-5 h-5" />
            </div>
            <span className="text-sm text-zinc-400">Yottly</span>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" className="rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center my-12">
            <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6">
              <YouTube className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Welcome to Yottly</h1>
            <h2 className="text-xl text-zinc-400 mb-4">Can I help you with anything?</h2>
            <p className="text-sm text-zinc-500">
              Ready to assist you with anything you need, from answering<br />
              questions to providing recommendations. Let's get started!
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto mb-8 px-10">
            <Card className="bg-zinc-800 border-zinc-700 p-4">
              <Plane className="w-5 h-5 mb-3" />
              <h3 className="font-medium mb-1">Youtube Video Summarizer</h3>
              <p className="text-xs text-zinc-400">From Podcasts to Plots</p>
            </Card>
            
            <Card className="bg-zinc-800 border-zinc-700 p-4">
              <Hand className="w-5 h-5 mb-3" />
              <h3 className="font-medium mb-1">Transcribe with Timestamp</h3>
              <p className="text-xs text-zinc-400">Say Bye Bye to tedious Caption extraction</p>
            </Card>
            
            <Card className="bg-zinc-800 border-zinc-700 p-4">
              <Wrench className="w-5 h-5 mb-3" />
              <h3 className="font-medium mb-1">Analyze Playlists</h3>
              <p className="text-xs text-zinc-400">Filter your Playlists as per Needs</p>
            </Card>
          </div>

          {/* Input Area */}
          <div className="flex space-x-2 w-1/2 mx-auto">
            <Button variant="ghost" size="icon" className="rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path d="M12 3v18M3 12h18" />
              </svg>
            </Button>
            <Input 
              className="flex-1 bg-zinc-800 border-zinc-700 rounded-full"
              placeholder="Ask SayHalo anything..."
            />
            <Button className="rounded-full bg-red-600 hover:bg-rose-500">
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;