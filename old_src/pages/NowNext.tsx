/**
 * Now / Next Component
 * Lightweight section that gently explains what's happening here right now
 */

import './NowNext.css';

interface NowNextProps {
  now?: string;
  next?: string;
}

export function NowNext({ now, next }: NowNextProps) {
  return (
    <div className="now-next">
      {now && (
        <div className="now-next__item">
          <div className="now-next__label">Now</div>
          <div className="now-next__content">{now}</div>
        </div>
      )}
      {next && (
        <div className="now-next__item">
          <div className="now-next__label">Next</div>
          <div className="now-next__content">{next}</div>
        </div>
      )}
      {!now && !next && (
        <div className="now-next__item">
          <div className="now-next__content">This is where you manage this section.</div>
        </div>
      )}
    </div>
  );
}
