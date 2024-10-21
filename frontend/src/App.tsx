
import { BrowserRouter,Route, Routes } from "react-router-dom"
import './App.css'
import { Landing } from './screens/landing'
import { Upload } from './screens/upload'
import { Result } from './screens/result'

function App() {
  return (
    <>
      <BrowserRouter basename='/'>
            <Routes>
              <Route path='/' element = {<Landing/>}></Route>
              <Route path='/upload' element = {<Upload/>}></Route>
              <Route path='/result' element = {<Result/>}></Route>
            </Routes>
      </BrowserRouter>
    </>

  )
}

export default App
