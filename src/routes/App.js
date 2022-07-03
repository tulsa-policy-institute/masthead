import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
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
        <h1 className="text-md md:text-5xl font-semibold">	<span className="text-tpi-blue">&#47;&#47;</span> Tulsa Policy Institute</h1>
      </header>
      <main className="max-w-full p-12 sm:grid sm:grid-cols-2 gap-8 bg-[#FBFBFB]">
        <Routes>
          <Route path="/" element={
            <Search questions={questions} lectures={lectures}/>
          }/>
          <Route path="/lectures/:slug" element={<Lecture />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
