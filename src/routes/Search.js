import React, { useState, useEffect } from 'react'
import * as fuzzysort from 'fuzzysort';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
// import PLAY_IMAGE from '../images/play.png';

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
    <div className='flex flex-wrap mt-4 max-h-10 overflow-hidden'>
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
      {displayResults.map((q) =>
        <div key={q.id} onClick={() => handleChange({ value: q })} className='cursor-pointer hover:bg-slate-100 m-0 border-b-gray-200 border-b'>
          <h3 className='sm:text-lg text-md m-1 p-3'>
            {q.Title}
          </h3>
        </div>
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

const TypeaheadSearch = ({ setTypedInput }) => {
  return <>
    <input
      type="text"
      className="
        form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
      "
      id="search-question"
      placeholder='Ask a question...'
      style={{
        borderRadius: '9999px',
        filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
        borderColor: '#fff',
      }}
      onChange={(e) => setTypedInput(e.target.value)}
    />
  </>;
}

function Search({ questions, lectures }) {
  const [selectedQuestion, setSelectedQuestion] = useState();
  const [typedInput, setTypedInput] = useState();

  const navigate = useNavigate();

  const handleChange = (selected) => {
    setSelectedQuestion(selected);
  }

  const filteredLectures = lectures.filter(lecture => {
    if (selectedQuestion) {
      return lecture.Questions.includes(selectedQuestion.value.id);
    } else {
      return true;
    }
  });

  useEffect(() => {
    if (filteredLectures.length === 1) {
      const [lecture] = filteredLectures;

      navigate(`/lectures/${lecture.id}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLectures]);

  return <div className='grid gap-8'>
    <div className=''>
      <TypeaheadSearch
        setTypedInput={setTypedInput}
      />
      <Results
        results={questions}
        typedInput={typedInput}
        setSelectedQuestion={setSelectedQuestion}
        handleChange={handleChange}
      />
    </div>
  </div>;
}

export default Search;
