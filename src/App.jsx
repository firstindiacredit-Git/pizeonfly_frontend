
import './App.css'
import Signup from './pages/Signup'
import EmployeeSinup from './pages/EmployeeSinup'
import Signin from './pages/Signin'
import EmployeeSinin from './pages/EmployeeSinin'


import {HashRouter, Routes, Route} from 'react-router-dom'
import ProjectDashboard from './pages/ProjectDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import Member from './pages/Member'
import Project from './pages/Project'
import EmployeeProject from './pages/EmployeeProject'
import Tasks from './pages/Tasks'
import EmployeeTasks from './pages/EmployeeTask' 
import Images from './pages/Image'
import Client from './pages/Client'

// import Test from './pages/test'


function App() {

  return (
    <HashRouter >
      <Routes >
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/employeesignup' element={<EmployeeSinup />}></Route>
        <Route path='/' element={<Signin />}></Route>
        <Route path='/employeesignin' element={<EmployeeSinin />}></Route>
        
        <Route path='/project-dashboard' element={<ProjectDashboard />}></Route>
        <Route path='/employee-dashboard' element={<EmployeeDashboard />}></Route>
        <Route path='/members' element={<Member />}></Route>
        <Route path='/projects' element={<Project />}></Route>
        <Route path='/employee-projects' element={<EmployeeProject />}></Route>
        <Route path='/tasks' element={<Tasks />}></Route>        
        <Route path='/employee-tasks' element={<EmployeeTasks />}></Route>   
        <Route path='/images' element={<Images/>}></Route>   
        <Route path='/clients' element={<Client/>}></Route>   



          




      </Routes>
    </HashRouter>
  )
}

export default App
