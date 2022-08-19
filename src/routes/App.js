import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Routes, Route, Link } from 'react-router-dom';
import ReactGA from 'react-ga';
import { useCookies, CookiesProvider, withCookies } from 'react-cookie';
import Modal from '../ui/modal';
import Lecture from './Lecture';
import Search from './Search';

ReactGA.initialize('UA-237465950-1');

function App() {
  const [lectures, setLectures] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [cookies, setCookie] = useCookies(['tpi-email']);
  const [showModal, toggleModal] = useState(!cookies.email);
  const [modalEmailEntry, setEmail] = useState();

  const handleContinue = () => {
    setCookie('email', modalEmailEntry);
    ReactGA.set({ userId: modalEmailEntry }, ['tpi-email']);
  }

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
    <CookiesProvider>
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
      {showModal && <Modal toggle={toggleModal} cont={handleContinue}>
        <div>
          <h1 className='text-2xl'>Need to know about Tulsa's permitting process, what a Mayor can veto, or how your tax dollars are being spent?</h1>
          <br/>
          <p>Welcome to the Tulsa Policy Institute! We work to make Tulsa the national leader in civic confidence by developing products that answer all your most deeply held questions about government and public policy in the 918.</p>
          <br/>
          <p>You have visited during a very special time. We are in the midst of running our pilot program where you can submit and check out answers to all your questions!</p>
          <br/>
          <div className="flex justify-start">
            <div className="mb-3 xl:w-96">
              <label
                htmlFor="exampleFormControlInput1"
                className="form-label inline-block mb-2 text-gray-700"
              >
                Email Address
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                className="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                id="exampleFormControlInput1"
                placeholder="me@email.com"
              />
            </div>
          </div>
        </div>
      </Modal>}
    </CookiesProvider>
  );
}

export default withCookies(App);
