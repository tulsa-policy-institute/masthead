import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as fuzzysort from 'fuzzysort';
import { isMobile } from 'react-device-detect';
import { withCookies } from 'react-cookie';
import Result from './Result';
import useAnalyticsEventTracker from '../utils/eventTracking';

const TAG_COLOR_LOOKUP = {
  'city government & the policy process': '#00AAAD',
  'revenue & spending': '#FF8BE6',
  'policies & regulations': '#FF5C00',
  'public services': '#9747FF',
};

function randomize(list) {
  return list.sort( () => Math.random() - 0.5)
}

const suggestedSearchCount = isMobile ? 3 : 8;

const Results = ({ results, handleChange, typedInput, cookies }) => {
  const [concepts, setConcepts] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedFilters, setFilters] = useState([]);
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
    key: 'Title',
    limit: suggestedSearchCount,
    threshold: -5000,
  }).map(f => f.obj);

  const displayResults = (() => {
    if (selectedFilters.length && !typedInput) {
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
      {tags.map((c, i) => <div
        key={i}
        style={{ backgroundColor: TAG_COLOR_LOOKUP[c] }}
        className={`text-white select-none bg-gray-200 p-2 m-1 rounded-lg text-sm cursor-pointer ${selectedFilters.includes(c) ? 'bg-purple-200' : ''}`}
        onClick={() => {
          if (selectedFilters.includes(c)) {
            setFilters(selectedFilters.filter(s => !(s === c)));
            gaFilteringTracker('unset', c);
          } else {
            setFilters([...selectedFilters, c]);
            gaFilteringTracker('set', c);
          }
        }}
      >
        {c}
      </div>)}
    </div>
    <div className='shadow-lg mt-4 rounded-2xl'>
      <div className='border-b-gray-200 border-b'>
        <h6 className='text-sm text-gray-400 m-1 p-3 select-none'>
          {typedInput ? (hasResults ? 'Results' : 'No results') : 'Suggested Searches'}
        </h6>
      </div>
      {displayResults.map((q, i) =>
        <Result
          q={q}
          key={i}
        />
      )}
      {!hasResults ?
        <div className='max-w-prose'>
          <div className='border-b-gray-200 border-b p-4'>
            <>
              <script src="https://static.airtable.com/js/embed/embed_snippet_v1.js"></script>
              <iframe
                title='question submission'
                className="w-full border-4 border-tpi-blue rounded-3xl airtable-embed airtable-dynamic-height"
                src={`https://airtable.com/embed/shrCUY2iaVckOGjbX?prefill_Question=${typedInput}&prefill_Email=${cookies.get('email')}&prefill_Role=${cookies.get('role')}`}
                frameBorder="0"
                height="500"
                style={{
                  background: 'transparent',
                }}
                />
            </>
          </div>
        </div> : <></>
      }
    </div>
  </>
};

export default withCookies(Results);
