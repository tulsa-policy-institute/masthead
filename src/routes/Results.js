import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as fuzzysort from 'fuzzysort';
import { isMobile } from 'react-device-detect';
import { withCookies } from 'react-cookie';
import Result from './Result';
import useAnalyticsEventTracker from '../utils/eventTracking';

const TAG_COLOR_LOOKUP = {
  'city government & the policy process': '#00AAAD',
  'revenue & spending': '#9747FF',
  'policies & regulations': '#FF5C00',
  'public services': '#FF8BE6',
};

export const CATEGORY_ICON_LOOKUP = {
  'city government & the policy process': 'icon_lg_citygov-policy.png',
  'revenue & spending': 'icon_lg_revenue-spending.png',
  'policies & regulations': 'icon_lg_policies-regs.png',
  'public services':  'icon_lg_publ-services.png',
}

function randomize(list) {
  return list.sort( () => Math.random() - 0.5)
}

const suggestedSearchCount = isMobile ? 3 : 8;

const Results = ({ results, typedInput, cookies, onCategoryChange }) => {
  const [concepts, setConcepts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedFilters, setFilters] = useState([]);
  const [iframeLoaded, iframeDidLoad] = useState(false);
  const gaFilteringTracker = useAnalyticsEventTracker('Filtering');

  useEffect(() => {
    async function getData() {
      const { data } = await axios('/data/concepts.min.json');
      const concepts = data
        .filter(c => c['Questions'])
        .sort((a, b) => b['Questions'].length - a['Questions'].length);
      const tags = (() => {
        // flatten array
        const tags = concepts.filter(c => c['Tags']).map(c => c['Tags']).reduce((acc, curr) => [...acc, ...curr], []);

        // get unique
        return  Array.from(new Set(tags));
      })();

      setTags(tags);
      setConcepts(concepts);
    }

    getData();
  }, []);

  const filteredQuestions = fuzzysort.go(typedInput, results, {
    key: 'Question',
    limit: suggestedSearchCount,
    threshold: -5000,
  }).map(f => f.obj);

  const displayResults = (() => {
    if (selectedFilters.length) {
      return results.filter(r => selectedFilters
        .map(f => concepts.filter(c => c['Tags']).find(c => c['Tags'].includes(f))['Questions'])
        .reduce((acc, curr) => { return [...acc, ...curr] }, [])
        .includes(r.id)
      );
    } else {
      return typedInput ? filteredQuestions : randomize(results).slice(0, suggestedSearchCount);
    }
  })();
  const hasResults = displayResults.length;

  return <>
    <div className='flex flex-wrap mt-4 overflow-wrap place-content-center'>
      {tags.filter(t => Object.keys(CATEGORY_ICON_LOOKUP).includes(t)).map((c, i) => <div
        key={i}
        style={{ backgroundColor: selectedFilters.includes(c) ? TAG_COLOR_LOOKUP[c] : '' }}
        className={`text-white select-none bg-gray-200/50 p-2 m-1 rounded-lg text-sm cursor-pointer`}
        onClick={() => {
          if(selectedFilters.includes(c)) {
            gaFilteringTracker('unset', c);
            setFilters([]);
            onCategoryChange('');
          } else {
            gaFilteringTracker('set', c);
            setFilters([c]);
            onCategoryChange(c);
          }
        }}
      >
        <img className='inline w-4 h-4 mr-2' src={`/images/icons/${CATEGORY_ICON_LOOKUP[c]}`} alt={c}/>
        {c}
      </div>)}
    </div>
    <div className='shadow-lg mt-4 rounded-2xl bg-[#FBFBFB]'>
      <div className='border-b-gray-200 border-b'>
        <h6 className='text-sm text-gray-400 m-1 p-3 select-none'>
          {typedInput ? (hasResults ? 'Results' : 'No results') : 'Suggested Searches'}
        </h6>
      </div>
      {displayResults.map((q, i) =>
        <Result
          q={q}
          key={q.id}
        />
      )}
      {!hasResults ?
        <div className='max-w'>
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
                src={`https://airtable.com/embed/shrCUY2iaVckOGjbX?prefill_Question=${typedInput}&prefill_Email=${cookies.get('email')}&prefill_Role=${cookies.get('role')}`}
                frameBorder="0"
                height="500"
                style={{
                  background: 'transparent',
                }}
                />
            </div>
          </div>
        </div> : <></>
      }
    </div>
  </>
};

export default withCookies(Results);
