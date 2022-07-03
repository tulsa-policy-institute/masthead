import React, { useEffect, useState } from 'react'
import { useParams  } from 'react-router-dom';

function Lecture({ lectures }) {
  const [lecture, setLecture] = useState({});
  const { id } = useParams();

  useEffect(() => {
    setLecture(lectures.find(l => l.id === id));
  }, [lectures, id]);

  return <>
    <h1 className='text-2xl text-bold'>{lecture?.Title}</h1>
    <p className='mt-2'>
      {lecture?.Description}
    </p>
  </>;
}

export default Lecture;
