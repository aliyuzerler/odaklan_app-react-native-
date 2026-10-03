import { useEffect, useReducer } from 'react';
import { AppState } from 'react-native';
import { useTimer } from '@/store/timer';

/**
 * Kalan süreyi duvar saatine göre hesaplar; running'da 250ms'de bir yeniden çizilir.
 * Uygulama ön plana döndüğünde anında doğru değere atlar (arka planda JS timer'ları
 * duraklatıldığı için ilk çizim bayat kalmasın).
 */
export function useRemainingMs(): number {
  const status = useTimer((s) => s.status);
  const endAt = useTimer((s) => s.endAt);
  const remainingMs = useTimer((s) => s.remainingMs);
  const [, forceRender] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    if (status !== 'running' || !endAt) return;
    const id = setInterval(forceRender, 250);
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') forceRender();
    });
    return () => {
      clearInterval(id);
      appState.remove();
    };
  }, [status, endAt]);

  // Bilinçli purity istisnası: canlı geri sayım duvar saatini render'da okur;
  // yeniden çizimi yukarıdaki interval + AppState tetikler.
  // eslint-disable-next-line react-hooks/purity
  return status === 'running' && endAt ? Math.max(0, endAt - Date.now()) : remainingMs;
}
