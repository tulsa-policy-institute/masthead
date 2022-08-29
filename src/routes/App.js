import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Routes, Route, Link, useSearchParams } from 'react-router-dom';
import ReactGA from 'react-ga';
import { CookiesProvider, withCookies } from 'react-cookie';
import Modal from '../ui/modal';
import Search from './Search';

ReactGA.initialize('UA-237465950-1');

function App({ cookies }) {
  const [lectures, setLectures] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sources, setSources] = useState([]);
  const [showModal, toggleModal] = useState((!cookies.get('email') || !cookies.get('role')));
  const [modalEmailEntry, setEmail] = useState();
  const [modalRoleSelection, setRole] = useState();
  const [searchParams] = useSearchParams();

  const isQuerying = searchParams.get('q') || searchParams.get('c');

  const handleContinue = () => {
    cookies.set('email', modalEmailEntry);
    cookies.set('role', modalRoleSelection);

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
      const { data } = await axios('/data/sources.min.json');

      setSources(data);
    }

    getData();
  }, []);

  useEffect(() => {
    async function getData() {
      const { data: questions } = await axios('/data/questions.min.json');
      const publicQuestions = questions.filter(q => q['Public']);

      const merged = publicQuestions.map(q => {
        return {
          ...q,
          'Sources': q['Sources']?.map(sourceId => {
            return sources.find(source => source.id === sourceId);
          }).filter(Boolean),
        }
      });

      setQuestions(merged);
    }

    getData();
  }, [sources]);

  return (
    <CookiesProvider>
      <header className={`p-4 max-w-full shadow-lg shadow-gray-200 border-b-white border-b-2 ${isQuerying ? 'bg-[#FBFBFB]' : 'text-white bg-black'}`}>
        <div className='container mx-auto'>
          <Link to='/?q=' className="text-md md:text-5xl font-semibold">	<span className="text-tpi-blue">&#47;&#47;</span> Tulsa Policy Institute</Link>
        </div>
      </header>
      <main className="max-w-full h-full">
        <Routes>
          <Route path="/" element={
            <Search questions={questions} lectures={lectures}/>
          }/>
        </Routes>
      </main>
      <footer className='m-4'>
      </footer>
      {showModal && <Modal toggle={toggleModal} cont={handleContinue}>
        <div>
          <h1 className='text-2xl'> You've Got Questions. We've Got Answers.</h1>
          <br/>
          <p>Welcome to Tulsa Policy Institute! We work to make Tulsa the national leader in civic confidence by developing products that answer all your most deeply held questions about government and public policy in the 918.</p>
          <br/>
          <p>You have visited during a very special time. September 2022 is our our pilot program where you can explore answers to all your questions about policy and service delivery in Tulsa!</p>
          <br/>
          <div className="flex flex-col justify-start">
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
            <div className="mb-3 xl:w-96">
              <label
                htmlFor="exampleFormControlInput2"
                className="form-label inline-block mb-2 text-gray-700"
              >
                Role
              </label>
              <select
                id="exampleFormControlInput2"
                onChange={e => {console.log(e); setRole(e.target.value)}}
                defaultValue=""
                className="form-select appearance-none
                block
                w-full
                px-3
                py-1.5
                text-base
                font-normal
                text-gray-700
                bg-white bg-clip-padding bg-no-repeat
                border border-solid border-gray-300
                rounded
                transition
                ease-in-out
                m-0
                focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" aria-label="Default select example">
                  <option value="citizen">I am a resident of Tulsa</option>
                  <option value="bureaucrat">I work at the City of Tulsa</option>
                  <option value="candidate">I have run for Tulsa's City Council</option>
                  <option value="nonprofit">I work at a nonprofit in Tulsa</option>
                  <option value="business">I am a business owner in Tulsa</option>
                  <option value="nonresident">I am not a resident of Tulsa</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>}
    </CookiesProvider>
  );
}

export default withCookies(App);
