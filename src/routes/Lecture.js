import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom';

function Lecture({ lectures, questions }) {
  const [lecture, setLecture] = useState({});
  const { id } = useParams();

  useEffect(() => {
    setLecture(lectures.find(l => l.id === id));
  }, [lectures, id]);

  return <div className='flex flex-col flex-col-reverse gap-10 sm:flex-row sm:gap-20'>
    <div className='basis-1/2 truncate'>
      {lectures.map((l, i) =>
        {
          const isCurrentLecture = l.id === id;
          if (isCurrentLecture) {
            const lectureQuestions = questions.filter(q => l['Questions'].includes(q.id))

            return <div key={i} className='border-0 border-t-2 border-b-4 border-black p-1'>
              <h1 className='text-2xl font-light truncate'>{l.Question}</h1>
              <div className='flex flex-row'>
                <div className='basis-1/3'>
                  <h2 className='uppercase text-xs font-thin'>Scope</h2>
                  <span className=''>
                    {l['Scope']}
                  </span>
                </div>
                <div className='basis-2/3'>
                  <h2 className='upper text-xs font-thin uppercase'>Questions answered</h2>
                  {lectureQuestions.length && lectureQuestions.map((lq, li) =>
                    <div key={li} className='whitespace-normal font-light pb-1'>{lq['Question']}</div>
                  )}
                </div>
              </div>
            </div>
          } else {
            return <Link key={i} to={`/lectures/${l.id}`}>
              <div className='border-0 border-b border-b-black p-1'>
                <h1 className='text-xl font-extralight truncate hover:font-normal'>{l.Question}</h1>
              </div>
            </Link>
          }
        }
      )}
    </div>
    <div className='basis-1/2'>
      <h1 className='text-4xl text-bold'>
        {lecture?.Question}
      </h1>
      <p className='mt-2 whitespace-pre-line'>
        {lecture?.Description}
      </p>
    </div>
  </div>;
}

export default Lecture;
