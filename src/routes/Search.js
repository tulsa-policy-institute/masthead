import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import Results from './Results';
import useAnalyticsEventTracker from '../utils/eventTracking';
import { CATEGORY_ICON_LOOKUP } from './Results';
import { withCookies } from 'react-cookie';
// import PLAY_IMAGE from '../images/play.png';

const CATEGORY_COLOR_LOOKUP = {
  'city gov & policy process': 'tpi-green',
  'revenue & spending': 'tpi-purple',
  'policies & regulations': 'tpi-orange',
  'public services': 'tpi-pink',
}

const TypeaheadSearch = withCookies(({ setTypedInput, className, typedInput = '', children, cookies }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isQuerying = searchParams.get('init');
  const showClear = isQuerying && typedInput;
  const doSearch = () => { searchParams.set('init', true); setSearchParams(searchParams) };

  return <div className={className}>
    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
    <div className="relative">
      <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none z-10">
        <svg aria-hidden="true" className="m-1 w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        {children}
      </div>
      <div
        className='bg-transparent tpi-blur'
        style={{
          borderRadius: '36px',
          background: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '1px 8px 20px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <input
          autoFocus={cookies.get('email') ? true : false}
          value={typedInput || ''}
          onChange={(e) => setTypedInput(e.target.value)}
          type="text"
          id="default-search"
          className="p-4 pl-[4.5rem] w-full text-sm bg-transparent rounded-3xl border-0 text-white focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              doSearch();
            }
          }}
        />
      </div>
      {typedInput && <div
        className="flex absolute inset-y-0 right-0 items-center pr-3 text-white cursor-pointer"
        onClick={() => showClear ? setTypedInput('') : doSearch()}
      >
        {showClear ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg> :
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>}
      </div>}
    </div>
  </div>;
})

function Search({ questions, lectures }) {
  const [selectedQuestion, setSelectedQuestion] = useState();
  const [, setTypedInput] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isQuerying = searchParams.get('init');
  const typedInput = searchParams.get('q');
  const lastSelectedCategory = searchParams.get('c');
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
    grid
    gap-8
    h-full`}>
    <div
      style={{ backgroundImage: 'url("/images/landing-mobile_opt.png")', backgroundSize: 'cover' }}
      className={`absolute w-full h-full transition-all duration-300 pointer-events-none ${isQuerying ? 'opacity-0' : ''}`}
    >
      <video className='tpi-marquee' autoPlay loop muted playsInline poster="/images/landing-mobile_opt.png">
        <source src="/videos/tpi_marquee.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div className={`${isQuerying ? '' : 'place-self-center'} flex flex-col container mx-auto p-4 sm:p-8`}>
      <TypeaheadSearch
        className='w-full sm:w-3/5 place-self-center relative'
        typedInput={typedInput}
        setTypedInput={(...args) => {
          gaEventTracker('type', args[0]);
          setTypedInput(...args);
          searchParams.set('q', args[0]);
          if (!searchParams.get('init')) {
            searchParams.set('init', true);
          }
          setSearchParams(searchParams);
        } }
      >
        {lastSelectedCategory && <div className={`rounded bg-${CATEGORY_COLOR_LOOKUP[lastSelectedCategory]}`}>
          <img
            className='w-4 h-4 m-1'
            src={`/images/icons/${CATEGORY_ICON_LOOKUP[lastSelectedCategory]}`} alt={lastSelectedCategory}
          />
        </div>}
      </TypeaheadSearch>
      <Results
        results={questions}
        typedInput={typedInput}
        setSelectedQuestion={setSelectedQuestion}
        isQuerying={isQuerying}
      />
    </div>
  </div>;
}

export default Search;
