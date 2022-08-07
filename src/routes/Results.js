import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as fuzzysort from 'fuzzysort';
import { isMobile } from 'react-device-detect';
import Result from './Result';

function randomize(list) {
  return list.sort( () => Math.random() - 0.5)
}

const suggestedSearchCount = isMobile ? 3 : 8;


const Results = ({ results, handleChange, typedInput }) => {
  const [concepts, setConcepts] = useState([]);
  const [selectedFilters, setFilters] = useState([]);

  useEffect(() => {
    async function getData() {
      const { data } = await axios('/data/concepts.min.json');
      const concepts = data
        .filter(c => c['Questions'])
        .sort((a, b) => b['Questions'].length - a['Questions'].length);

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
        .map(f => concepts.find(c => c.id === f)['Questions'])
        .reduce((acc, curr) => { return [...acc, ...curr] }, [])
        .includes(r.id)
      );
    } else {
      return typedInput ? filteredQuestions : randomize(results).slice(0, suggestedSearchCount);
    }
  })();
  const hasResults = displayResults.length;

  return <>
    <div className='flex flex-wrap mt-4 overflow-wrap'>
      {concepts.map((c, i) => <div
        key={i}
        className={`bg-gray-200 p-2 m-1 rounded-lg text-sm cursor-pointer ${selectedFilters.includes(c.id) ? 'bg-purple-200' : ''}`}
        onClick={() => {
          if (selectedFilters.includes(c.id)) {
            setFilters(selectedFilters.filter(s => !(s === c.id)));
          } else {
            setFilters([...selectedFilters, c.id])
          }
        }}
      >
        {c['Name']} ({c['Questions'].length})
      </div>)}
    </div>
    <div className='shadow-lg mt-4 rounded-2xl'>
      <div className='border-b-gray-200 border-b'>
        <h6 className='text-sm text-gray-400 m-1 p-3'>
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
          <h1 className='text-2xl m-4'>
            Think this question should be included in our database? Submit your query below and get a notification when results have been populated.
          </h1>
          <div className='border-b-gray-200 border-b p-4'>
            <>
              <script src="https://static.airtable.com/js/embed/embed_snippet_v1.js"></script>
              <iframe
                title='question submission'
                className="w-full border-4 border-tpi-blue rounded-3xl airtable-embed airtable-dynamic-height"
                src={`https://airtable.com/embed/shrCUY2iaVckOGjbX?prefill_Question=${typedInput}`}
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

export default Results;
