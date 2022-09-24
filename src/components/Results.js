import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as fuzzysort from 'fuzzysort';
import { isMobile } from 'react-device-detect';
import { useSearchParams } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import Result from './Result';
import useAnalyticsEventTracker from '../utils/eventTracking';
import QuestionForm from './QuestionForm';

const TAG_COLOR_LOOKUP = {
  'city gov & policy process': '#00AAAD',
  'revenue & spending': '#9747FF',
  'policies & regulations': '#FF5C00',
  'public services': '#FF8BE6',
};

export const CATEGORY_ICON_LOOKUP = {
  'city gov & policy process': 'icon_lg_citygov-policy.png',
  'revenue & spending': 'icon_lg_revenue-spending.png',
  'policies & regulations': 'icon_lg_policies-regs.png',
  'public services':  'icon_lg_publ-services.png',
}

function randomize(list) {
  return list.sort( () => Math.random() - 0.5)
}

const suggestedSearchCount = isMobile ? 3 : 8;

const Results = ({ results, typedInput, cookies, isQuerying }) => {
  const [concepts, setConcepts] = useState([]);
  const [tags, setTags] = useState([]);
  const [subFilter, setSubFilter] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const gaFilteringTracker = useAnalyticsEventTracker('Filtering');
  const selectedFilters = searchParams.get('c') || '';

  useEffect(() => {
    async function getData() {
      const { data } = await axios('/data/concepts.min.json');
      const concepts = data
        .filter(c => c['Questions'])
        .filter(c => c['Tags'])
        .sort((a, b) => b['Questions'].length - a['Questions'].length);
      const tags = (() => {
        // flatten array
        const tags = concepts.map(c => c['Tags']).reduce((acc, curr) => [...acc, ...curr], []);

        // get unique
        return Array.from(new Set(tags));
      })();

      setTags(tags);
      setConcepts(concepts);
    }

    getData();
  }, []);

  const searchingQs = fuzzysort.go(typedInput, results, {
    keys: ['Answer', 'Question'],
    limit: suggestedSearchCount,
  });

  const filteredQuestions = searchingQs.map(f => f.obj);

  const displayResults = (() => {
    if (selectedFilters.length && concepts.length) {
      const matchingConcepts = concepts
        .filter(c => c['Tags'])
        .filter(c => c['Tags'].includes(selectedFilters))
        .map(c => c['Questions'])
        .reduce((acc, curr) => { return [...acc, ...curr] }, []);

      const matchingMegaNames = concepts
        .filter(c => c['MegaName'])
        .filter(c => c['MegaName'].includes(subFilter))
        .map(c => c['Questions'])
        .reduce((acc, curr) => { return [...acc, ...curr] }, []);

      const matchingResults = results
        .filter(r => matchingConcepts.includes(r.id))
        .filter(r => {
            return subFilter ? matchingMegaNames.includes(r.id) : r;
        });

      const uniqueTextMatches = filteredQuestions
        .filter(r => !matchingResults.map(r => r.id).includes(r.id))

      return [...(typedInput ? uniqueTextMatches : []), ...matchingResults];
    } else {
      return typedInput ? filteredQuestions : randomize(results).slice(0, suggestedSearchCount);
    }
  })();

  return <>
    <div className='flex flex-wrap mt-2 overflow-wrap place-content-center z-10'>
      {tags.filter(t => Object.keys(CATEGORY_ICON_LOOKUP).includes(t)).map((c, i) => <div
        key={i}
        style={{ backgroundColor: selectedFilters.includes(c) ? TAG_COLOR_LOOKUP[c] : '' }}
        className={`text-white select-none bg-gray-200/20 tpi-blur p-2 m-1 rounded-lg text-xs cursor-pointer`}
        onClick={() => {
          if(selectedFilters.includes(c)) {
            gaFilteringTracker('unset', c);
            searchParams.set('c', '');
            setSubFilter('');
            setSearchParams(searchParams);
          } else {
            gaFilteringTracker('set', c);
            searchParams.set('c', c);
            searchParams.set('init', true);
            setSubFilter('');
            setSearchParams(searchParams);
          }
        }}
      >
        <img className='inline w-4 h-4 mr-2' src={`/images/icons/${CATEGORY_ICON_LOOKUP[c]}`} alt={c}/>
        {c}
      </div>)}
    </div>
    {selectedFilters && <div className='flex flex-wrap overflow-wrap place-content-center'>
      {Array.from(new Set(concepts
        .filter(c => c['Tags']?.includes(selectedFilters) && c['Questions'] && c['MegaName'])
        .map(c => c['MegaName'])
        .reduce((a, c) => [...a, ...c], [])))
        .map(
          (c) => <div
            onClick={() => {
              if (c === subFilter) {
                setSubFilter('');  
              } else {
                setSubFilter(c);
              }
            }}
            style={{ backgroundColor: subFilter.includes(c) ? TAG_COLOR_LOOKUP[selectedFilters] : '' }}
            className='text-white select-none bg-gray-200/50 p-2 m-1 rounded-lg text-sm cursor-pointer'
            key={c}
          >
            {c}
          </div>
        )
      }
    </div>}
    {isQuerying && <div className='shadow-lg mt-4 rounded-2xl bg-[#FBFBFB]'>
      <div className='border-b-gray-200 border-b'>
        <h6 className='text-sm text-gray-400 m-1 p-3 select-none'>
          Results
        </h6>
      </div>
      {displayResults.map((q, index, array) =>
        <>
          <Result
            q={q}
            key={q.id}
          />
        </>
      )}

    </div>}
  </>
};

export default withCookies(Results);
