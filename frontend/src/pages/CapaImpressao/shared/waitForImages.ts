/** Aguarda todas as <img> do documento terminarem de carregar antes de resolver. */
export function waitForImages(): Promise<void> {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
  const unloaded = imgs.filter(img => !img.complete);
  if (!unloaded.length) return Promise.resolve();
  return new Promise(resolve => {
    let remaining = unloaded.length;
    const done = () => { if (--remaining === 0) resolve(); };
    unloaded.forEach(img => {
      img.addEventListener('load',  done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  });
}