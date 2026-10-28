import { useState } from 'react';
import { assets } from '../data/assets';
export function Scene({ index, className = '', reference }: { index: number; className?: string; reference?: string }) {
  const [failed, setFailed] = useState(false);
  const [referenceFailed, setReferenceFailed] = useState(false);
  return <div className={`scene scene-${index} ${className}`} aria-hidden="true">
    {reference && !referenceFailed ? <img className="scene-override" src={reference} alt="" onError={() => setReferenceFailed(true)} />
      : !failed ? <img className={`scene-sprite sprite-${index}`} src={assets.scenes} alt="" onError={() => setFailed(true)} /> : <div className="scene-fallback"><div className="scene-window"/><div className="silhouette"/><div className="scene-floor"/></div>}
    <div className="scene-shade" />
  </div>;
}
