import React, { useState } from 'react';
import useAnalyticsEventTracker from '../utils/eventTracking';

const Result = ({ q }) => {
  const [open, updateResult] = useState(false);
  const gaResultTracker = useAnalyticsEventTracker('Result');

  return <>
    <div
      onClick={() => {
        if (!open) { gaResultTracker('viewing', q.Question); }
        updateResult(!open);
      }}
      className='cursor-pointer hover:bg-slate-100 m-0 border-b-gray-200 border-b'
    >
      <h3 className='sm:text-lg text-md m-1 p-3 pointer-events-none select-none'>
        {q.Question}
        <svg
          className={`float-right w-6 h-6 rotate-180 shrink-0 ${open ? '' : 'scale-[-1]'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        ><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </h3>
    </div>
    {open &&
        <div className={`p-4 bg-gray-100 ${open ? 'visible' : 'invisible'}`}>
          <div className='max-w-prose mb-2'>{q.Answer}</div>
          <div className='uppercase italic font-mono text-slate-500 text-xs max-w-prose'>
            {q.Source}
          </div>
        </div>
      }
  </>;
}

export default Result;
