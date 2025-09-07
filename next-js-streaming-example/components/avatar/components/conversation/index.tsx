import React, { useEffect, useCallback, useState } from "react";
import {
	DailyAudio,
	DailyVideo,
	useMeetingState,
	useDevices,
	useDaily
} from '@daily-co/daily-react';

import { useCVICall } from '../../hooks/use-cvi-call';
import { useReplicaIDs } from '../../hooks/use-replica-ids';
import { MicSelectBtn, CameraSelectBtn, ScreenShareButton } from '../device-select';
import { type TranscriptMessage } from '../transcript'

export interface IConversation {
  conversation_id: string
  conversation_url: string
};

type ConversationProps = {
	conversationUrl: string;
	onLeave: () => void;
};

const AvatarVideo = React.memo(() => {
	const replicaIds = useReplicaIDs();
	const replicaId = replicaIds[0];

	if (!replicaId) {
		return (
			<div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
				<p className="text-white">Connecting to avatar...</p>
			</div>
		);
	}

	return (
		<div className="relative h-full bg-black rounded-lg overflow-hidden">
			<DailyVideo
				automirror={false}
				sessionId={replicaId}
				type="video"
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'contain', // Changed from 'cover' to prevent trimming
				}}
			/>
			<div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
				Avatar
			</div>
		</div>
	);
});

// UserVideo component removed - using existing FaceWidgets instead

export const Conversation = React.memo(({ onLeave, conversationUrl }: ConversationProps) => {
	const { joinCall, leaveCall } = useCVICall();
	const meetingState = useMeetingState();
	const { hasMicError } = useDevices();
	const daily = useDaily();
	const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([]);

	useEffect(() => {
		if (meetingState === 'error') {
			onLeave();
		}
	}, [meetingState, onLeave]);

	// Initialize call when conversation is available
	useEffect(() => {
		joinCall({ url: conversationUrl });
	}, [conversationUrl, joinCall]);

	// Listen for transcript events via Daily app-message
	// Note: Transcript data is collected in background for backend analysis (UI hidden)
	useEffect(() => {
		if (!daily) return;

		const handleAppMessage = (event: { data?: { event_type?: string; properties?: { role?: string; speech?: string } } }) => {
			console.log('App message received:', event);
			
			// Check if this is a conversation utterance event
			if (event.data?.event_type === 'conversation.utterance') {
				const { properties } = event.data;
				if (properties?.role && properties?.speech) {
					const newMessage: TranscriptMessage = {
						id: `${Date.now()}-${Math.random()}`,
						role: properties.role === 'user' ? 'user' : 'replica',
						speech: properties.speech,
						timestamp: new Date()
					};
					
					// Store transcript data for backend analysis (not displayed in UI)
					setTranscriptMessages(prev => [...prev, newMessage]);
				}
			}
		};

		daily.on('app-message', handleAppMessage);

		return () => {
			daily.off('app-message', handleAppMessage);
		};
	}, [daily]);

	const handleLeave = useCallback(() => {
		leaveCall();
		onLeave();
	}, [leaveCall, onLeave]);

	return (
		<div className="flex flex-col h-full">
			{hasMicError && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<p>Camera or microphone access denied. Please check your settings and try again.</p>
				</div>
			)}

			{/* Main content area - full width avatar only */}
			<div className="flex-1">
				{/* Avatar video - full width */}
				<div className="w-full h-full bg-black rounded-lg overflow-hidden">
					<AvatarVideo />
				</div>
			</div>

			{/* Control buttons */}
			<div className="flex justify-center items-center gap-4 p-4 bg-gray-50 rounded-b-lg">
				<MicSelectBtn />
				<CameraSelectBtn />
				<ScreenShareButton />
				<button 
					type="button" 
					onClick={handleLeave}
					className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
					title="Leave conversation"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M18 6L6 18M6 6L18 18"/>
					</svg>
					Leave
				</button>
			</div>

			<DailyAudio />
		</div>
	);
});
