import React, { useState } from 'react';
import { withCookies } from 'react-cookie';

const QuestionForm = ({ typedInput = '', cookies  }) => {
  const [iframeLoaded, iframeDidLoad] = useState(false);

  return <div className='max-w'>
    <div className='border-b-gray-200 border-b p-4'>
      <div className='border-4 border-tpi-blue rounded-3xl'>
        {iframeLoaded ? '' : <>
          <svg className="animate-spin mt-10 mx-auto h-10 w-10 text-tpi-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </>}
        <script src="https://static.airtable.com/js/embed/embed_snippet_v1.js"></script>
        <iframe
          title='question submission'
          onLoad={() => {iframeDidLoad(true)}}
          className={`${iframeLoaded ? 'visible' : 'invisible'} w-full rounded-3xl airtable-embed airtable-dynamic-height`}
          src={`https://airtable.com/embed/shrCUY2iaVckOGjbX?prefill_Question=${typedInput || ''}&prefill_Email=${cookies.get('email') || ''}&prefill_Role=${cookies.get('role') || ''}`}
          frameBorder="0"
          height="500"
          style={{
            background: 'transparent',
          }}
          />
      </div>
    </div>
  </div>;
}

export default withCookies(QuestionForm);
