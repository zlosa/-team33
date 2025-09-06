import { None, Optional } from "../../lib/utilities/typeUtilities";
import { AudioPrediction } from "../../lib/data/audioPrediction";
import { AudioWidgets } from "./AudioWidgets";

type ProsodyWidgetsProps = {
  onTimelineUpdate?: (predictions: AudioPrediction[]) => void;
};

export function ProsodyWidgets({ onTimelineUpdate }: ProsodyWidgetsProps) {
  return (
    <div>
      <AudioWidgets 
        modelName="prosody" 
        recordingLengthMs={500} 
        streamWindowLengthMs={5000}
        onTimeline={onTimelineUpdate}
      />
    </div>
  );
}

ProsodyWidgets.defaultProps = {
  onTimelineUpdate: None,
};
