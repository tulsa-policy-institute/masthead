import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Routes, Route, Link } from 'react-router-dom';
import Lecture from './Lecture';
import Search from './Search';

function App() {
  const [lectures, setLectures] = useState([]);
  const [questions, setQuestions] = useState([]);

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

  return (
    <>
      <header className="p-4 max-w-full shadow-lg shadow-gray-200 header-clip bg-[#FBFBFB]">
        <Link to='/' className="text-md md:text-5xl font-semibold">	<span className="text-tpi-blue">&#47;&#47;</span> Tulsa Policy Institute</Link>
      </header>
      <main className="max-w-full p-12 bg-[#FBFBFB] h-full">
        <Routes>
          <Route path="/" element={
            <Search questions={questions} lectures={lectures}/>
          }/>
          <Route path="/lectures/:id" element={lectures.length && <Lecture lectures={lectures} />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
