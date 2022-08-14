import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Routes, Route, Link } from 'react-router-dom';
import Lecture from './Lecture';
import Search from './Search';
import ReactGA from 'react-ga';

ReactGA.initialize('3983541346');

function App() {
  const [lectures, setLectures] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

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
      const publicQuestions = data.filter(q => q['Public']);
      setQuestions(publicQuestions);
    }

    getData();
  }, []);

  return (
    <>
      <header className="p-4 max-w-full shadow-lg shadow-gray-200 header-clip bg-[#FBFBFB]">
        <div className='container mx-auto'>
          <Link to='/' className="text-md md:text-5xl font-semibold">	<span className="text-tpi-blue">&#47;&#47;</span> Tulsa Policy Institute</Link>
        </div>
      </header>
      <main className="max-w-full p-4 sm:p-8 bg-[#FBFBFB]">
        <div className='container mx-auto'>
          <Routes>
            <Route path="/" element={
              <Search questions={questions} lectures={lectures}/>
            }/>
            <Route path="/lectures/:id" element={lectures.length && <Lecture lectures={lectures} questions={questions} />} />
          </Routes>
        </div>
      </main>
      <footer className='m-4'>
      </footer>
    </>
  );
}

export default App;
