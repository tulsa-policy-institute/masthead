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
  const FORMAT_OPTIONS = ['Text', 'SMS', 'Email', 'Webinar', 'Map', 'Consultation'];

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
          {typedInput ? (hasResults ? 'Results' : 'Submit a question') : 'Suggested Searches'}
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
        <div className='m-0 border-b-gray-200 border-b m-4'>
          <p className='sm:text-lg text-md'>
            We couldn't find a match for your question, but please submit your question and we'll get back to you:
          </p>
          <h1 className='text-3xl'>{typedInput}</h1>
          <div className="flex justify-start">
            <div>
              {FORMAT_OPTIONS.map((option, index) =>
                <div className="form-check" key={index}>
                  <input
                    className="form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                    type="radio"
                    name='format'
                    id={option}
                  />
                  <label className="form-check-label inline-block text-gray-800" htmlFor={option}>
                    {option}
                  </label>
                </div>
              )}
            </div>
          </div>
          <button className='bg-green-400 p-2 rounded-md'>Submit</button>
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
