import { Emotion } from "../../lib/data/emotion";

type TopEmotionsProps = {
  className?: string;
  emotions: Emotion[];
  numEmotions: number;
};

export function TopEmotions({ className, emotions, numEmotions }: TopEmotionsProps) {
  className = className || "";

  return (
    <div className={`${className}`}>
      {emotions
        .sort((a: Emotion, b: Emotion) => b.score - a.score)
        .slice(0, numEmotions)
        .map((emotion, i) => (
          <div key={i} className="mb-1 flex rounded-full border border-neutral-200 dark:border-neutral-800 text-xs shadow">
            <div className="flex w-6 justify-center rounded-l-full bg-white dark:bg-neutral-900 py-1 pl-2 pr-2 font-medium text-neutral-800 dark:text-neutral-100">
              <span>{i + 1}</span>
            </div>
            <div className="w-32 bg-neutral-800 dark:bg-neutral-700 px-2 py-1 lowercase text-white">
              <span>{emotion.name}</span>
            </div>
            <div className="flex w-12 justify-center rounded-r-full bg-white dark:bg-neutral-900 py-1 pr-2 pl-2 font-medium text-neutral-800 dark:text-neutral-100">
              <span>{emotion.score.toFixed(2)}</span>
            </div>
          </div>
        ))}
    </div>
  );
}

TopEmotions.defaultProps = {
  numEmotions: 3,
};
