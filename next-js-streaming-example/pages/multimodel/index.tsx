import { FaceWidgets } from "../../components/widgets/FaceWidgets";
import { ProsodyWidgets } from "../../components/widgets/ProsodyWidgets";
import { BurstWidgets } from "../../components/widgets/BurstWidgets";

export default function MultiModelPage() {
  return (
    <div className="px-6 pt-10 pb-20 sm:px-10 md:px-14">
      <div className="pb-6 text-2xl font-medium text-neutral-800">Multi-Model Real-time Analysis</div>
      <div className="pb-6 text-neutral-600">
        Real-time analysis combining facial expressions, speech prosody, and vocal bursts using separate WebSocket connections.
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Facial Expression Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Facial Expression Analysis</h2>
          <FaceWidgets />
        </div>

        {/* Speech Prosody Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Speech Prosody Analysis</h2>
          <ProsodyWidgets />
        </div>

        {/* Vocal Burst Section */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-neutral-700 mb-4">Vocal Burst Analysis</h2>
          <BurstWidgets />
        </div>
      </div>
    </div>
  );
}
