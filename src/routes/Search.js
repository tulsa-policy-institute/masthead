import React, { useState, useEffect } from 'react'
import * as fuzzysort from 'fuzzysort';
import { useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
// import PLAY_IMAGE from '../images/play.png';

function randomize(list) {
  return list.sort( () => Math.random() - 0.5)
}

const suggestedSearchCount = isMobile ? 3 : 8;

const Results = ({ results, handleChange, typedInput }) => {
  const filteredQuestions = fuzzysort.go(typedInput, results, {
    key: 'Title',
    limit: suggestedSearchCount,
    threshold: -5000,
  }).map(f => {console.log(f.score); return f.obj});

  const displayResults = (typedInput ? filteredQuestions : randomize(results).slice(0, suggestedSearchCount));

  return <>
    <div className='shadow-lg mt-4 rounded-2xl'>
      <div className='border-b-gray-200 border-b'>
        <h6 className='text-sm text-gray-400 m-1 p-3'>
          {typedInput ? 'Results' : 'Suggested Searches'}
        </h6>
      </div>
      {displayResults.map((q) =>
        <div key={q.id} onClick={() => handleChange({ value: q })} className='cursor-pointer hover:bg-slate-100 m-0 border-b-gray-200 border-b'>
          <h3 className='sm:text-lg text-md m-1 p-3'>
            {q.Title}
          </h3>
        </div>
      )}
      {!displayResults.length ?
        <div className='m-0 border-b-gray-200 border-b'>
          <h3 className='sm:text-lg text-md m-1 p-3'>
            We couldn't find a matching question but please click to submit your question! ->
            "{typedInput}""
          </h3>
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
