import React, { useState, useEffect } from 'react'
import axios from 'axios';

function App() {
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    async function getData() {
      const { data } = await axios('/data/lectures.min.json');

      setLectures(data);
    }

    getData();
  }, []);

  return (
    <>
      <header className="p-4 max-w-full shadow-lg shadow-gray-200 header-clip">
        <h1 className="text-md md:text-5xl font-semibold">	<span className="text-tpi-blue">&#47;&#47;</span> Tulsa Policy Institute</h1>
      </header>
      <main className="max-w-full p-12 sm:grid sm:grid-cols-2 gap-4">
        <div className="">Search</div>
        <div className="sm:grid sm:grid-cols-2 gap-8">
          {lectures.map((lecture) =>
            <a
              key={lecture.id}
              href="/"
              className='flex relative items-center text-white w-full h-32 bg-cover hover:shadow-2xl'
            >
              <span className='z-10 p-2'>
                <span className="text-sm">Lecture</span><br/>
                <span className="text-lg font-semibold leading-tight">{lecture['Title']}</span>
              </span>
              <div className={`absolute z-0 top-0 rounded-md brightness-75 w-full h-full bg-[url('https://picsum.photos/seed/${lecture.id}/300/200')]`}></div>
            </a>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
