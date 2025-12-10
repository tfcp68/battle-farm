import React from 'react';
import { EventDictionary as GlobalEventDictionary } from '@yantrix/core';
import { getBus } from '~/yantrix/coreLoop';

/**
 * Fullscreen intro overlay. Emits intro_complete into the shared EventBus.
 * No local FSM is created here.
 */
export default function IntroSplash({
                                        durationMs = 600,
                                        text = 'Battle Farm',
                                        onComplete,
                                    }: {
    durationMs?: number;
    text?: string;
    onComplete?: () => void;
}) {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            const dict = GlobalEventDictionary.getDictionary() as any;
            const eventId = dict?.intro_complete as number | undefined;
            if (eventId) {
                getBus().dispatch({ event: eventId, meta: {} });
            }
            onComplete?.();
        }, durationMs);

        return () => clearTimeout(timer);
    }, [durationMs, onComplete]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Intro"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 3000,
                background: 'rgba(0,0,0,0.85)',
                display: 'grid',
                placeItems: 'center',
                padding: 16,
            }}
        >
            <h1 className="intro-title" style={{ margin: 0 }}>{text}</h1>
        </div>
    );
}