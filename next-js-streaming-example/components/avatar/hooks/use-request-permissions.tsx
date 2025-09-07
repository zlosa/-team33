import { useCallback } from 'react';
import { useDaily } from '@daily-co/daily-react';
import type { DailyDeviceInfos } from '@daily-co/daily-js';

export const useRequestPermissions = (): (() => Promise<DailyDeviceInfos | void>) => {
	const daily = useDaily();

	const requestPermissions = useCallback(async () => {
		if (!daily) {
			console.log('Daily not available yet, skipping camera permissions');
			return;
		}
		return await daily.startCamera({
			startVideoOff: false,
			startAudioOff: false,
			audioSource: 'default',
			inputSettings: {
				audio: {
					processor: {
						type: 'noise-cancellation',
					},
				},
			},
		});
	}, [daily]);

	return requestPermissions;
};
