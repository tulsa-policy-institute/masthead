import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { useNavigate, Link } from 'react-router-dom';

function randomize(list) {
  return list.sort( () => Math.random() - 0.5)
}

function Search({ questions, lectures }) {
  const [selectedQuestion, setSelectedQuestion] = useState();
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

  return <>
    <div className=''>
      <Select
        styles={{
          control: (provided) => ({
            ...provided,
            borderRadius: '9999px',
            filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))',
            borderColor: '#fff',
          }),
        }}
        placeholder=''
        options={questions.map(q => ({ value: q, label: q.Title }))}
        onChange={handleChange}
        isClearable={true}
      />
      <div className='shadow-lg mt-4 rounded-2xl'>
        <div className='border-b-gray-200 border-b'>
          <h6 className='text-sm text-gray-400 m-1 p-3'>Suggested Searches</h6>
        </div>
        {randomize(questions).slice(0, 8).map((q) =>
          <div key={q.id} onClick={() => handleChange({ value: q })} className='cursor-pointer hover:bg-slate-100 m-0 border-b-gray-200 border-b'>
            <h3 className='text-lg m-1 p-3'>{q.Title}</h3>
          </div>
        )}
      </div>
    </div>
    <div className="sm:grid sm:grid-cols-2 gap-8">
      {filteredLectures.map((lecture) =>
        <Link
          to={`/lectures/${lecture.id}`}
          key={lecture.id}
          href="/"
          className='flex relative items-center text-white w-full h-32 hover:shadow-2xl'
        >
          <span className='z-10 p-2'>
            <span className="text-sm">Lecture</span><br/>
            <span className="text-lg font-semibold leading-tight">{lecture['Title']}</span>
          </span>
          <div style={{
            backgroundImage: `url('https://picsum.photos/seed/${lecture.id}/300/200')`
          }} className='absolute z-0 top-0 bg-cover rounded-xl brightness-75 w-full h-full'></div>
        </Link>
      )}

      {!filteredLectures.length && 
        <div>No results match...</div>
      }
    </div>
  </>;
}

export default Search;
