import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import Results from './Results';
import useAnalyticsEventTracker from '../utils/eventTracking';
import { CATEGORY_ICON_LOOKUP } from './Results';
import { withCookies } from 'react-cookie';
// import PLAY_IMAGE from '../images/play.png';

const CATEGORY_COLOR_LOOKUP = {
  'city government & the policy process': 'tpi-green',
  'revenue & spending': 'tpi-purple',
  'policies & regulations': 'tpi-orange',
  'public services': 'tpi-pink',
}

const TypeaheadSearch = withCookies(({ setTypedInput, className, typedInput = '', children, cookies }) => {
  return <div className={className}>
    <input
      type="text"
      autoFocus={cookies.get('email') ? true : false}
      value={typedInput || ''}
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
        pl-10
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
    {children}
  </div>;
})

function Search({ questions, lectures }) {
  const [selectedQuestion, setSelectedQuestion] = useState();
  const [, setTypedInput] = useState();
  const [lastSelectedCategory, updateSelectedCategory] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const typedInput = searchParams.get('q');
  const gaEventTracker = useAnalyticsEventTracker('Search');

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

  return <div className={`
    transition-all
    duration-300
    bg-gradient-to-b
    rotating-background
    grid
    gap-8
    h-full`}>
    <div
      style={{ backgroundImage: 'url("/images/landing-mobile_opt.png")', backgroundSize: 'cover' }}
      className={`absolute w-full h-full transition-all duration-300 pointer-events-none ${typedInput ? 'opacity-0' : ''}`}
    >
      <video className='h-full w-full hidden sm:block' autoPlay loop muted playsInline>
        <source src="/videos/tpi_marquee.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div className={`${typedInput ? '' : 'place-self-center'} flex flex-col container mx-auto p-4 sm:p-8`}>
      <TypeaheadSearch
        className='w-full sm:w-3/5 place-self-center relative'
        typedInput={typedInput}
        setTypedInput={(...args) => {
          gaEventTracker('type', args[0]);
          setTypedInput(...args);
          setSearchParams({ q: args[0] })
        } }
      >
        {lastSelectedCategory && <div className={`absolute rounded mt-1 ml-3 top-0 bg-${CATEGORY_COLOR_LOOKUP[lastSelectedCategory]}`}>
          <img
            className='inline w-4 h-4 m-1'
            src={`/images/icons/${CATEGORY_ICON_LOOKUP[lastSelectedCategory]}`} alt={lastSelectedCategory}
          />
        </div>}
      </TypeaheadSearch>
      {typedInput ? <Results
        results={questions}
        typedInput={typedInput}
        setSelectedQuestion={setSelectedQuestion}
        onCategoryChange={(category) => {
          updateSelectedCategory(category);
        }}
      /> : <></>}
    </div>
  </div>;
}

export default Search;
