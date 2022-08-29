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
  return <div className={className}>
    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
    <div className="relative">
      <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
        <svg aria-hidden="true" className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <input
        autoFocus={cookies.get('email') ? true : false}
        value={typedInput || ''}
        onChange={(e) => setTypedInput(e.target.value)}
        type="text"
        id="default-search"
        className="p-4 pl-10 w-full text-sm bg-gray-50/25 rounded-3xl border-0 text-white focus:outline-none"
        style={{
          filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
        }}
      />
      {typedInput && <div
        className="flex absolute inset-y-0 right-0 items-center pr-3 text-white cursor-pointer"
        onClick={() => setTypedInput('')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </div>}
    </div>
  </div>;


  // <div className={className}>
  //   <input
  //     type="text"
  //     autoFocus={cookies.get('email') ? true : false}
  //     value={typedInput || ''}
  //     className="
  //       form-control
  //       block
  //       w-full
  //       px-3
  //       py-1.5
  //       text-base
  //       font-normal
  //       text-gray-700
  //       bg-slate-50/75 bg-clip-padding
  //       border border-solid border-gray-300
  //       rounded
  //       transition
  //       ease-in-out
  //       m-0
  //       focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
  //       pl-10
  //     "
  //     id="search-question"
  //     placeholder='Ask a question...'
  //     style={{
  //       borderRadius: '9999px',
  //       filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
  //       borderColor: '#fff',
  //     }}
  //     onChange={(e) => setTypedInput(e.target.value)}
  //   />
  //   {children}
  // </div>;
})

function Search({ questions, lectures }) {
  const [selectedQuestion, setSelectedQuestion] = useState();
  const [, setTypedInput] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isQuerying = searchParams.get('q') || searchParams.get('c');
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
      <video className='h-full w-full hidden sm:block' autoPlay loop muted playsInline>
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
          setSearchParams(searchParams);
        } }
      >
        {lastSelectedCategory && <div className={`absolute rounded mt-1 ml-3 top-0 bg-${CATEGORY_COLOR_LOOKUP[lastSelectedCategory]}`}>
          <img
            className='inline w-4 h-4 m-1'
            src={`/images/icons/${CATEGORY_ICON_LOOKUP[lastSelectedCategory]}`} alt={lastSelectedCategory}
          />
        </div>}
      </TypeaheadSearch>
      {isQuerying ? <Results
        results={questions}
        typedInput={typedInput}
        setSelectedQuestion={setSelectedQuestion}
        onCategoryChange={(category) => {
          // searchParams.set('c', [category]);
          // setSearchParams(searchParams);
        }}
      /> : <></>}
    </div>
  </div>;
}

export default Search;
