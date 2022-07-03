import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { useNavigate, Link } from 'react-router-dom';

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
  }, [filteredLectures]);

  return <>
    <div className="">
      <Select
        options={questions.map(q => ({ value: q, label: q.Title }))}
        onChange={handleChange}
        isClearable={true}
      />
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
