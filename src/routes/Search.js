import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Results from './Results';
import useAnalyticsEventTracker from '../utils/eventTracking';
// import PLAY_IMAGE from '../images/play.png';

const TypeaheadSearch = ({ setTypedInput, className }) => {
  return <div className={className}>
    <input
      type="text"
      autoFocus={true}
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
  </div>;
}

function Search({ questions, lectures }) {
  const [selectedQuestion, setSelectedQuestion] = useState();
  const [typedInput, setTypedInput] = useState();
  const navigate = useNavigate();

  const gaEventTracker = useAnalyticsEventTracker('Search');
  
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

  return <div className='grid gap-8 h-full'>
    <div className={`absolute w-max h-max transition-all pointer-events-none ${typedInput ? 'opacity-0' : ''}`}>
      <video className='h-full w-full' autoPlay loop muted>
        <source src="/videos/tpi_questions_marquee.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div className='flex flex-col place-self-center container mx-auto p-4 sm:p-8'>
      <TypeaheadSearch
        className='w-full sm:w-3/5 place-self-center'
        setTypedInput={(...args) => { gaEventTracker('type', args[0]); setTypedInput(...args) } }
      />
      {typedInput ? <Results
        results={questions}
        typedInput={typedInput}
        setSelectedQuestion={setSelectedQuestion}
        handleChange={handleChange}
      /> : <></>}
    </div>
  </div>;
}

export default Search;
