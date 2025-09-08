import { useState } from "react";
import { Button } from "./inputs/Button";

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ isOpen, onAccept }: DisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 dark:border-neutral-700">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">
              Welcome to HEUMN AI
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300">
              Emotion and Expression Analysis Platform
            </p>
          </div>
          
          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-3">
                📋 How to Get the Full Experience
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
                <li>Navigate to the <strong>"Multi-Modal"</strong> section from the main menu</li>
                <li>Click <strong>"Start"</strong> to begin the analysis</li>
                <li>Allow camera and microphone permissions when prompted</li>
                <li>Speak naturally and show facial expressions for best results</li>
              </ol>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-3">
                ⚠️ Important Disclaimer
              </h3>
              <div className="text-amber-700 dark:text-amber-300 space-y-3 text-sm">
                <p>
                  <strong>This is a hackathon project for demonstration purposes only.</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>This tool is for <strong>informational and entertainment purposes only</strong></li>
                  <li>Does <strong>NOT provide medical diagnosis</strong> or professional advice</li>
                  <li>Results should <strong>NOT be used for clinical decisions</strong></li>
                  <li>Your privacy is respected - data is processed locally when possible</li>
                  <li>By using this tool, you acknowledge these limitations</li>
                </ul>
                <p className="pt-2 text-xs">
                  For inquiries about this project, contact Eric Chong at{" "}
                  <a 
                    href="mailto:eric@mytongueai.com" 
                    className="underline hover:text-amber-600 dark:hover:text-amber-400"
                  >
                    eric@mytongueai.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              text="I Understand & Accept"
              onClick={onAccept}
            />
          </div>
        </div>
      </div>
    </div>
  );
}