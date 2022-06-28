import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Select from 'react-select'

function App() {
  const [lectures, setLectures] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState();

  useEffect(() => {
    async function getData() {
      const { data } = await axios('/data/lectures.min.json');

      setLectures(data);
    }

    getData();
  }, []);

  useEffect(() => {
    async function getData() {
      const { data } = await axios('/data/questions.min.json');

      setQuestions(data);
    }

    getData();
  }, []);

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

  return (
    <>
      <header className="p-4 max-w-full shadow-lg shadow-gray-200 header-clip">
        <h1 className="text-md md:text-5xl font-semibold">	<span className="text-tpi-blue">&#47;&#47;</span> Tulsa Policy Institute</h1>
      </header>
      <main className="max-w-full p-12 sm:grid sm:grid-cols-2 gap-8">
        <div className="">
          <Select
            options={questions.map(q => ({ value: q, label: q.Title }))}
            onChange={handleChange}
            isClearable={true}
          />
        </div>
        <div className="sm:grid sm:grid-cols-2 gap-8">
          {filteredLectures.map((lecture) =>
            <a
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
            </a>
          )}

          {!filteredLectures.length && 
            <div>No results match...</div>
          }
        </div>
      </main>
    </>
  );
}

export default App;
