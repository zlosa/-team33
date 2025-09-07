import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MultiModelPage from '../pages/multimodel';

let faceCallback: any;
let prosodyCallback: any;
let burstCallback: any;

jest.mock('../components/widgets/FaceWidgets', () => ({
  FaceWidgets: ({ onEmotionUpdate }: any) => {
    faceCallback = onEmotionUpdate;
    return <div data-testid="face-widget" />;
  },
}));

jest.mock('../components/widgets/ProsodyWidgets', () => ({
  ProsodyWidgets: ({ onTimelineUpdate }: any) => {
    prosodyCallback = onTimelineUpdate;
    return <div data-testid="prosody-widget" />;
  },
}));

jest.mock('../components/widgets/BurstWidgets', () => ({
  BurstWidgets: ({ onTimeline }: any) => {
    burstCallback = onTimeline;
    return <div data-testid="burst-widget" />;
  },
}));

describe('MultiModelPage', () => {
  test('session management flow', () => {
    render(<MultiModelPage />);

    expect(
      screen.getByText(/Idle\. Click Start Recording to begin\./i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    expect(
      screen.getByText(/Collecting data for analysis/i)
    ).toBeInTheDocument();

    // simulate one data update so hasData becomes true
    faceCallback([{ name: 'joy', score: 0.9 }], 0.9);

    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));
    expect(
      screen.getByText(/Recording stopped\. Ready to analyze\./i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /resume recording/i }));
    expect(
      screen.getByText(/Collecting data for analysis/i)
    ).toBeInTheDocument();
  });

  test('handles analysis request', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        overall_autism_likelihood: 0.2,
        assessment_confidence: 0.9,
        evaluation_priority: 'medium',
      }),
    });
    // @ts-ignore
    global.fetch = fetchMock;

    render(<MultiModelPage />);
    fireEvent.click(screen.getByRole('button', { name: /start recording/i }));
    // simulate predictions to populate data
    faceCallback([{ name: 'joy', score: 0.9 }], 0.9);
    prosodyCallback([{ timestamp: 0, emotions: [] }]);
    burstCallback([{ timestamp: 0, emotions: [] }]);
    fireEvent.click(screen.getByRole('button', { name: /stop recording/i }));
    fireEvent.click(screen.getByRole('button', { name: /complete analysis/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8000/analyze');
    expect(
      await screen.findByText(/Autism Assessment Results/i)
    ).toBeInTheDocument();
  });
});
