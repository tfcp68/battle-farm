import React from 'react';

export default function JoinRequestPopup({
                                           gameId,
                                           hostPlayerId,
                                           onAccept,
                                           onCancel,
                                         }: {
  gameId?: string | null;
  hostPlayerId?: string | null;
  onAccept: () => void;
  onCancel: () => void;
}) {
  return (
      <div
          role="dialog"
          aria-modal="true"
          aria-label="Join Request"
          // Фиксированный оверлей по всему экрану с затемнением
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(0,0,0,0.6)',
            display: 'grid',
            placeItems: 'center',
            padding: 16, // чтобы карточка не прилипала к краям на маленьких экранах
          }}
      >
        <div
            className="auth-card"
            // Не даём клику “пробить” оверлей (если потом захочешь закрывать по клику вне карточки)
            onClick={e => e.stopPropagation()}
            style={{ width: 420, maxWidth: '92vw' }}
        >
          <h3 className="section-title" style={{ margin: 0, textAlign: 'center' }}>
            Запрос на присоединение
          </h3>
          <small className="muted" style={{ textAlign: 'center' }}>
            Вы отправили запрос на присоединение в лобби {gameId ?? '—'}
            {hostPlayerId ? `, хост: ${hostPlayerId}` : ''}
          </small>

          <div className="actions">
            <button className="ok" onClick={onAccept}>Принять реквест</button>
            <button className="warn" onClick={onCancel}>Отмена</button>
          </div>
        </div>
      </div>
  );
}